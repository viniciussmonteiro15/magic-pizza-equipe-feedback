import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App.jsx';

// Cada teste começa com a "aba" equipe ativa e armazenamento limpo.
beforeEach(() => {
  window.location.hash = '#equipe';
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('Fluxo de cadastro, login e disponibilidade', () => {
  it('cadastra um funcionário, faz login com o RG e salva a disponibilidade', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const registerForm = () => within(container.querySelector('.register-form'));

    // ---- Cadastro ----
    await user.type(registerForm().getByLabelText(/Nome completo/i), 'Marina Souza Lima');
    await user.type(registerForm().getByLabelText(/^RG/i), '45.678.901-2');
    await user.type(registerForm().getByLabelText(/Idade/i), '24');

    // Seleciona "Sim" para CNH e "Garçom" para cargo via texto visível.
    await user.click(registerForm().getByRole('radio', { name: 'Sim' }));
    await user.click(registerForm().getByRole('radio', { name: /^Garçom/ }));

    await user.click(registerForm().getByRole('button', { name: /Cadastrar e continuar/i }));

    // Após o cadastro, o aviso de sucesso aparece e o modal de login abre automaticamente.
    expect(await screen.findByText(/Cadastro de Marina concluído/i)).toBeInTheDocument();
    const dialog = await screen.findByRole('dialog', { name: /Entrar/i });

    // ---- Login ----
    await user.type(within(dialog).getByLabelText(/^RG/i), '45.678.901-2');
    await user.click(within(dialog).getByRole('button', { name: /^Entrar$/i }));

    // ---- Painel de disponibilidade ----
    expect(await screen.findByText(/Olá, Marina/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Marina Souza Lima/i })).toBeInTheDocument();
    expect(screen.getByText('Garçom')).toBeInTheDocument();

    // Ativa segunda-feira com o preset "Noite" e salva.
    const mondayRow = screen.getByText('Segunda-feira').closest('li');
    await user.click(within(mondayRow).getByRole('checkbox'));
    await user.click(within(mondayRow).getByRole('button', { name: 'Noite' }));

    await user.click(screen.getByRole('button', { name: /Salvar disponibilidade/i }));

    expect(await screen.findByText(/Salvo às/i)).toBeInTheDocument();
    expect(screen.getByText('dia disponível')).toBeInTheDocument();
  });

  it('rejeita RG inválido no cadastro e impede duplicidade', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const registerForm = () => within(container.querySelector('.register-form'));

    await user.type(registerForm().getByLabelText(/Nome completo/i), 'João Pedro');
    await user.type(registerForm().getByLabelText(/^RG/i), 'abc');
    await user.type(registerForm().getByLabelText(/Idade/i), '30');
    await user.click(registerForm().getByRole('radio', { name: 'Não' }));
    await user.click(registerForm().getByRole('radio', { name: /^Pizzaiolo/ }));
    await user.click(registerForm().getByRole('button', { name: /Cadastrar e continuar/i }));

    expect(await screen.findByText(/RG inválido/i)).toBeInTheDocument();
  });

  it('mostra erro ao tentar entrar com um RG não cadastrado', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^Entrar$/i }));
    const dialog = await screen.findByRole('dialog', { name: /Entrar/i });
    await user.type(within(dialog).getByLabelText(/^RG/i), '99999999999');
    await user.click(within(dialog).getByRole('button', { name: /^Entrar$/i }));

    expect(await within(dialog).findByText(/RG não encontrado/i)).toBeInTheDocument();
  });
});

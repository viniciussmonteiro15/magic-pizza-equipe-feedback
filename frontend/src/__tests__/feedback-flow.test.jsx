import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App.jsx';

beforeEach(() => {
  window.location.hash = '#feedback';
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('Aba de Feedback', () => {
  it('exibe as avaliações de exemplo e o resumo calculado', async () => {
    render(<App />);
    expect(await screen.findByText(/avaliações$/)).toBeInTheDocument();
    expect(screen.getByText('Helena Martins')).toBeInTheDocument();
    // 3 elogios, 2 sugestões, 0 reclamações mostradas por padrão (todas exibidas).
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('filtra avaliações por tipo', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Helena Martins');

    await user.click(screen.getByRole('button', { name: 'Reclamações' }));
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByText(/Éramos 30 convidados/)).toBeInTheDocument();
  });

  it('envia uma nova avaliação e ela aparece no topo da lista', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Helena Martins');

    await user.type(screen.getByLabelText(/Seu nome/i), 'Patrícia Nunes');
    await user.click(screen.getByRole('radio', { name: 'Elogio' }));

    const notaGeral = screen.getByRole('radiogroup', { name: 'Nota geral' });
    await user.click(within(notaGeral).getByTitle('Excelente'));

    await user.type(
      screen.getByLabelText(/Mensagem/i),
      'A pizza de calabresa estava excelente e o atendimento foi muito atencioso do início ao fim.'
    );

    await user.click(screen.getByRole('button', { name: /Enviar avaliação/i }));

    const list = await screen.findAllByRole('article');
    expect(within(list[0]).getByText('Patrícia Nunes')).toBeInTheDocument();
    expect(list).toHaveLength(6);
  });

  it('exige nota e mensagem antes de enviar', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Helena Martins');

    await user.click(screen.getByRole('button', { name: /Enviar avaliação/i }));

    expect(await screen.findByText(/Escolha o tipo da mensagem/i)).toBeInTheDocument();
    expect(screen.getByText(/Dê uma nota geral/i)).toBeInTheDocument();
    expect(screen.getByText(/Escreva sua mensagem/i)).toBeInTheDocument();
  });
});

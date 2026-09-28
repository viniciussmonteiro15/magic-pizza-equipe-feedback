import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App.jsx';
import { computeCoverage } from '../utils/coverage';
import { registerEmployee, saveAvailability } from '../services/employeeService';
import { DAYS, DEFAULT_WINDOW, LOCAL_MANAGER_CODE } from '../utils/constants';

const week = (overrides = {}) =>
  Object.fromEntries(DAYS.map((d) => [d.id, { ativo: false, ...DEFAULT_WINDOW, ...(overrides[d.id] ?? {}) }]));

async function seedTeam() {
  const ana = await registerEmployee({ nome: 'Ana Souza', rg: '11111111', idade: 25, cnh: 'sim', cargo: 'garcom' });
  const bruno = await registerEmployee({ nome: 'Bruno Lima', rg: '22222222', idade: 30, cnh: 'nao', cargo: 'pizzaiolo' });
  await registerEmployee({ nome: 'Carla Dias', rg: '33333333', idade: 28, cnh: 'sim', cargo: 'ambos' });
  await saveAvailability(ana.id, week({ seg: { ativo: true }, ter: { ativo: true, inicio: '11:00', fim: '15:00' } }));
  await saveAvailability(bruno.id, week({ seg: { ativo: true } }));
}

async function unlock(user, code = LOCAL_MANAGER_CODE) {
  await user.type(screen.getByLabelText(/Código de acesso/i), code);
  await user.click(screen.getByRole('button', { name: 'Acessar' }));
}

beforeEach(() => {
  window.location.hash = '#gestao';
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('computeCoverage', () => {
  it('conta "ambos" nas duas funções e aponta a função descoberta', () => {
    const emps = [
      { cargo: 'garcom', disponibilidade: week({ seg: { ativo: true } }) },
      { cargo: 'ambos', disponibilidade: week({ ter: { ativo: true } }) },
    ];
    const cov = Object.fromEntries(computeCoverage(emps).map((c) => [c.id, c]));
    expect(cov.seg).toMatchObject({ garcons: 1, pizzaiolos: 0, gap: 'Falta pizzaiolo' });
    expect(cov.ter).toMatchObject({ garcons: 1, pizzaiolos: 1, gap: null });
    expect(cov.qua).toMatchObject({ total: 0, gap: 'Sem equipe' });
  });

  it('ignora dias ativos com horário inválido', () => {
    const emps = [{ cargo: 'garcom', disponibilidade: week({ seg: { ativo: true, inicio: '20:00', fim: '18:00' } }) }];
    expect(computeCoverage(emps)[0].garcons).toBe(0);
  });
});

describe('Aba Gestão', () => {
  it('pede o código do gestor e recusa código errado sem mostrar a equipe', async () => {
    await seedTeam();
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await unlock(user, 'errado');
    expect(await screen.findByText('Código incorreto.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Código de acesso/i));
    await unlock(user);
    expect(await screen.findByRole('table')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Bloquear' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Código de acesso/i)).toBeInTheDocument();
  });

  it('mostra estado vazio sem funcionários', async () => {
    const user = userEvent.setup();
    render(<App />);
    await unlock(user);
    expect(await screen.findByText(/Nenhum funcionário cadastrado/i)).toBeInTheDocument();
  });

  it('mostra a grade com horários e cobertura, e filtra por função', async () => {
    await seedTeam();
    const user = userEvent.setup();
    render(<App />);
    await unlock(user);

    const table = await screen.findByRole('table');
    const anaRow = within(table).getByText('Ana Souza').closest('tr');
    expect(within(anaRow).getByText('18:00–23:00')).toBeInTheDocument();
    expect(within(anaRow).getByText('11:00–15:00')).toBeInTheDocument();

    // Terça: só Ana (garçom) está disponível, então falta pizzaiolo.
    expect(within(table).getAllByText('Falta pizzaiolo').length).toBeGreaterThan(0);

    expect(within(table).getAllByRole('row').some((r) => r.textContent.includes('Carla Dias'))).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Pizzaiolos' }));
    expect(within(table).queryByText('Ana Souza')).not.toBeInTheDocument();
    // "Ambos" continua aparecendo no filtro de pizzaiolos.
    expect(within(table).getByText('Carla Dias')).toBeInTheDocument();
  });
});

/**
 * Integração real: sobe o backend como processo separado e roda os serviços do
 * frontend em modo API contra ele. Pulado se o backend não tiver `npm install`.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DAYS, DEFAULT_WINDOW } from '../utils/constants';

// O vitest roda a partir da pasta frontend/.
const backendDir = path.resolve(process.cwd(), '../backend');
const canRun = existsSync(path.join(backendDir, 'node_modules'));

const freePort = () =>
  new Promise((resolve) => {
    const srv = net.createServer().listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

const week = (overrides = {}) =>
  Object.fromEntries(DAYS.map((d) => [d.id, { ativo: false, ...DEFAULT_WINDOW, ...(overrides[d.id] ?? {}) }]));

describe.skipIf(!canRun)('serviços do frontend em modo API', () => {
  let child;
  let svc;
  let apiUrl;

  beforeAll(async () => {
    const port = await freePort();
    child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'src/server.js'], {
      cwd: backendDir,
      env: {
        ...process.env,
        PORT: String(port),
        DB_FILE: ':memory:',
        RG_PEPPER: 'pepper-de-teste-0123456789',
        TOKEN_SECRET: 'segredo-de-teste-0123456789',
        MANAGER_PASSWORD: 'gestor-123',
        LOGIN_MAX_ATTEMPTS: '1000',
      },
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('backend não subiu em 10s')), 10000);
      child.stdout.on('data', (chunk) => {
        if (String(chunk).includes('Magic Pizza API')) {
          clearTimeout(timer);
          resolve();
        }
      });
      child.on('exit', (code) => reject(new Error(`backend saiu com código ${code}`)));
    });

    apiUrl = `http://127.0.0.1:${port}`;
    vi.stubEnv('VITE_API_URL', apiUrl);
    vi.resetModules();
    svc = {
      employees: await import('../services/employeeService'),
      feedback: await import('../services/feedbackService'),
      manager: await import('../services/managerService'),
      errors: await import('../services/errors'),
    };
  }, 20000);

  afterAll(() => {
    child?.removeAllListeners('exit');
    child?.kill();
    vi.unstubAllEnvs();
  });

  beforeEach(() => window.sessionStorage.clear());

  it('cadastra, entra pelo RG, salva a disponibilidade e sai', async () => {
    const created = await svc.employees.registerEmployee({
      nome: 'Marina Souza Lima', rg: '45.678.901-2', idade: '24', cnh: 'sim', cargo: 'garcom',
    });
    expect(created).toMatchObject({ nome: 'Marina Souza Lima', cargo: 'garcom' });

    await expect(svc.employees.registerEmployee({
      nome: 'Outra Pessoa', rg: '456789012', idade: 30, cnh: 'nao', cargo: 'ambos',
    })).rejects.toMatchObject({ code: 'RG_DUPLICATE' });

    await expect(svc.employees.loginWithRg('99999999')).rejects.toMatchObject({
      code: 'NOT_FOUND', message: 'RG não encontrado.',
    });

    expect(svc.employees.getSessionEmployee()).toBeNull();
    const employee = await svc.employees.loginWithRg('45.678.901-2');
    expect(svc.employees.getSessionEmployee()).toMatchObject({ id: employee.id });

    const disponibilidade = week({ seg: { ativo: true, inicio: '11:00', fim: '15:00' } });
    const saved = await svc.employees.saveAvailability(employee.id, disponibilidade);
    expect(saved.disponibilidade.seg).toEqual({ ativo: true, inicio: '11:00', fim: '15:00' });
    expect(svc.employees.getSessionEmployee().disponibilidade.seg.ativo).toBe(true);

    svc.employees.logout();
    expect(svc.employees.getSessionEmployee()).toBeNull();
    await expect(svc.employees.saveAvailability(employee.id, disponibilidade)).rejects.toMatchObject({ status: 401 });
  });

  it('só lista a equipe depois do código de gestor', async () => {
    await expect(svc.employees.listEmployees()).rejects.toMatchObject({ status: 401 });

    expect(svc.manager.isManagerSession()).toBe(false);
    await expect(svc.manager.loginManager('errado')).rejects.toMatchObject({ code: 'INVALID_CODE' });
    await svc.manager.loginManager('gestor-123');
    expect(svc.manager.isManagerSession()).toBe(true);

    const team = await svc.employees.listEmployees();
    expect(team.find((e) => e.nome === 'Marina Souza Lima').disponibilidade.seg.ativo).toBe(true);

    svc.manager.logoutManager();
    expect(svc.manager.isManagerSession()).toBe(false);
  });

  it('envia e lista feedback no formato que a interface espera', async () => {
    const created = await svc.feedback.addFeedback({
      nome: '', tipo: 'elogio', nota: 5, categorias: { pizzas: 5, atendimento: 0 },
      mensagem: 'Tudo perfeito, pizza quentinha e equipe simpática.',
    });
    // Categorias sem nota (0) são descartadas antes de ir ao servidor.
    expect(created.categorias).toEqual({ pizzas: 5 });
    expect(created).toMatchObject({ tipo: 'elogio', nota: 5 });

    const list = await svc.feedback.listFeedback();
    expect(list[0]).toMatchObject({ id: created.id, criadoEm: expect.any(String) });
  });

  it('traduz servidor fora do ar em erro amigável', async () => {
    vi.stubEnv('VITE_API_URL', 'http://127.0.0.1:1');
    vi.resetModules();
    const offline = await import('../services/feedbackService');
    await expect(offline.listFeedback()).rejects.toMatchObject({ code: 'NETWORK' });
    vi.stubEnv('VITE_API_URL', apiUrl);
  });
});

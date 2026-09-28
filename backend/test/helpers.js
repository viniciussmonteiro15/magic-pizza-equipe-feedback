import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { openDb } from '../src/db.js';

export async function startServer(overrides = {}) {
  const config = {
    ...loadConfig({}),
    rgPepper: 'pepper-de-teste-0123456789',
    tokenSecret: 'segredo-de-teste-0123456789',
    managerPassword: 'gestor-123',
    writeMaxRequests: 1000,
    loginMaxAttempts: 1000, // o limite é testado à parte, num servidor próprio
    corsOrigins: ['http://localhost:5173'],
    ...overrides,
  };
  const db = openDb(':memory:');
  const server = createApp({ config, db }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api`;

  async function call(method, path, { body, token } = {}) {
    const res = await fetch(url + path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  }

  return {
    db,
    config,
    url,
    call,
    close: () => new Promise((resolve) => server.close(() => { db.close(); resolve(); })),
  };
}

export const person = (overrides = {}) => ({
  nome: 'Marina Souza Lima',
  rg: '45.678.901-2',
  idade: 24,
  cnh: 'sim',
  cargo: 'garcom',
  ...overrides,
});

export const week = (overrides = {}) =>
  Object.fromEntries(
    ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map((d) => [
      d,
      { ativo: false, inicio: '18:00', fim: '23:00', ...(overrides[d] ?? {}) },
    ])
  );

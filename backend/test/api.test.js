import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { person, startServer, week } from './helpers.js';

let api;
before(async () => {
  api = await startServer();
});
after(() => api.close());

const registerAndLogin = async (overrides) => {
  const p = person(overrides);
  await api.call('POST', '/employees', { body: p });
  const { body } = await api.call('POST', '/auth/login', { body: { rg: p.rg } });
  return body;
};

describe('funcionários', () => {
  it('cadastra, sem devolver nem gravar o RG', async () => {
    const res = await api.call('POST', '/employees', { body: person() });
    assert.equal(res.status, 201);
    assert.equal(res.body.employee.nome, 'Marina Souza Lima');
    assert.equal(Object.values(res.body.employee.disponibilidade).filter((d) => d.ativo).length, 0);
    assert.doesNotMatch(JSON.stringify(res.body), /45678901|45\.678/);

    const stored = JSON.stringify(api.db.prepare('SELECT * FROM employees').all());
    assert.doesNotMatch(stored, /45678901|45\.678/);
  });

  it('recusa dados inválidos apontando cada campo', async () => {
    const res = await api.call('POST', '/employees', {
      body: person({ nome: 'Marina', rg: 'abc', idade: 12, cnh: 'talvez', cargo: 'gerente' }),
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION');
    assert.deepEqual(Object.keys(res.body.error.details).sort(), ['cargo', 'cnh', 'idade', 'nome', 'rg']);
  });

  it('recusa RG repetido, mesmo com pontuação diferente', async () => {
    const res = await api.call('POST', '/employees', { body: person({ nome: 'Outra Pessoa', rg: '456789012' }) });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'RG_DUPLICATE');
  });

  it('faz login pelo RG e rejeita RG desconhecido', async () => {
    const ok = await api.call('POST', '/auth/login', { body: { rg: '45678901-2' } });
    assert.equal(ok.status, 200);
    assert.ok(ok.body.token);
    assert.equal(ok.body.employee.nome, 'Marina Souza Lima');

    const bad = await api.call('POST', '/auth/login', { body: { rg: '99999999' } });
    assert.equal(bad.status, 404);
    assert.equal(bad.body.error.code, 'NOT_FOUND');
  });

  it('protege /me: sem token, token adulterado e token de gestor não passam', async () => {
    const { token } = await registerAndLogin({ nome: 'Paulo Ricardo Alves', rg: '11122233' });

    assert.equal((await api.call('GET', '/employees/me')).status, 401);
    assert.equal((await api.call('GET', '/employees/me', { token: token.slice(0, -2) + 'xx' })).status, 401);
    assert.equal((await api.call('GET', '/employees/me', { token })).status, 200);

    const manager = await api.call('POST', '/manager/login', { body: { codigo: 'gestor-123' } });
    assert.equal((await api.call('GET', '/employees/me', { token: manager.body.token })).status, 403);
  });

  it('salva a disponibilidade e mantém depois', async () => {
    const { token } = await registerAndLogin({ nome: 'Julia Campos Reis', rg: '55566677' });
    const disponibilidade = week({ seg: { ativo: true, inicio: '11:00', fim: '15:00' }, sab: { ativo: true } });

    const saved = await api.call('PUT', '/employees/me/availability', { token, body: { disponibilidade } });
    assert.equal(saved.status, 200);
    assert.deepEqual(saved.body.employee.disponibilidade.seg, { ativo: true, inicio: '11:00', fim: '15:00' });

    const me = await api.call('GET', '/employees/me', { token });
    assert.deepEqual(me.body.employee.disponibilidade, disponibilidade);
  });

  it('recusa horário final antes do inicial e semana incompleta', async () => {
    const { token } = await registerAndLogin({ nome: 'Caio Mendes Rocha', rg: '77788899' });
    const reversed = week({ ter: { ativo: true, inicio: '20:00', fim: '18:00' } });
    const a = await api.call('PUT', '/employees/me/availability', { token, body: { disponibilidade: reversed } });
    assert.equal(a.status, 400);
    assert.ok(a.body.error.details.ter);

    const b = await api.call('PUT', '/employees/me/availability', { token, body: { disponibilidade: { seg: week().seg } } });
    assert.equal(b.status, 400);
  });
});

describe('gestor', () => {
  it('recusa código errado e libera o certo', async () => {
    assert.equal((await api.call('POST', '/manager/login', { body: { codigo: 'errado' } })).status, 401);
    assert.equal((await api.call('POST', '/manager/login', { body: {} })).status, 401);
    assert.equal((await api.call('POST', '/manager/login', { body: { codigo: 'gestor-123' } })).status, 200);
  });

  it('lista a equipe só com token de gestor, sem nenhum dado de RG', async () => {
    assert.equal((await api.call('GET', '/manager/team')).status, 401);

    const employee = await registerAndLogin({ nome: 'Rita Faria Lopes', rg: '33344455' });
    assert.equal((await api.call('GET', '/manager/team', { token: employee.token })).status, 403);

    const { body } = await api.call('POST', '/manager/login', { body: { codigo: 'gestor-123' } });
    const team = await api.call('GET', '/manager/team', { token: body.token });
    assert.equal(team.status, 200);
    assert.ok(team.body.employees.length >= 4);
    assert.ok(team.body.employees.every((e) => Object.keys(e.disponibilidade).length === 7));
    assert.doesNotMatch(JSON.stringify(team.body), /rg_lookup|rg"|3334445/i);
  });

  it('fica desativado quando MANAGER_PASSWORD não está configurado', async () => {
    const off = await startServer({ managerPassword: '' });
    const res = await off.call('POST', '/manager/login', { body: { codigo: '' } });
    assert.equal(res.status, 503);
    await off.close();
  });
});

describe('feedback', () => {
  const valid = { nome: 'Ana Paula', tipo: 'elogio', nota: 5, categorias: { pizzas: 5 }, mensagem: 'Pizza excelente e atendimento atencioso.' };

  it('cria e lista do mais novo para o mais antigo', async () => {
    const first = await api.call('POST', '/feedback', { body: valid });
    assert.equal(first.status, 201);
    await new Promise((r) => setTimeout(r, 5));
    await api.call('POST', '/feedback', { body: { ...valid, nome: '', tipo: 'sugestao', nota: 3, categorias: {} } });

    const list = await api.call('GET', '/feedback');
    assert.equal(list.status, 200);
    assert.equal(list.body.feedback[0].tipo, 'sugestao');
    assert.equal(list.body.feedback[0].nome, '');
    assert.deepEqual(list.body.feedback[1].categorias, { pizzas: 5 });
  });

  it('valida tipo, nota, categorias e tamanho da mensagem', async () => {
    const res = await api.call('POST', '/feedback', {
      body: { tipo: 'xingamento', nota: 9, categorias: { cozinha: 3 }, mensagem: 'curta' },
    });
    assert.equal(res.status, 400);
    assert.deepEqual(Object.keys(res.body.error.details).sort(), ['categorias', 'mensagem', 'nota', 'tipo']);
  });
});

describe('robustez', () => {
  it('trata JSON quebrado e rota inexistente sem vazar detalhes internos', async () => {
    const res = await fetch(`${api.url}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ quebrado',
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, 'INVALID_JSON');

    const missing = await api.call('GET', '/nao-existe');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error.code, 'NOT_FOUND');
  });

  it('limita tentativas de login por IP', async () => {
    const limited = await startServer({ loginMaxAttempts: 3 });
    const codes = [];
    for (let i = 0; i < 5; i += 1) {
      codes.push((await limited.call('POST', '/auth/login', { body: { rg: '12345678' } })).status);
    }
    assert.deepEqual(codes, [404, 404, 404, 429, 429]);
    await limited.close();
  });

  it('limita cadastros e feedbacks por IP', async () => {
    const limited = await startServer({ writeMaxRequests: 2 });
    const body = { tipo: 'elogio', nota: 5, mensagem: 'Mensagem de teste longa o bastante.' };
    const codes = [];
    for (let i = 0; i < 3; i += 1) codes.push((await limited.call('POST', '/feedback', { body })).status);
    assert.deepEqual(codes, [201, 201, 429]);
    await limited.close();
  });
});

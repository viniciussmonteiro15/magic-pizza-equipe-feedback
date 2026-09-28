import { HttpError } from './errors.js';

export const DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
export const ROLES = ['garcom', 'pizzaiolo', 'ambos'];
export const FEEDBACK_TYPES = ['elogio', 'sugestao', 'reclamacao'];
export const FEEDBACK_CATEGORIES = ['pizzas', 'atendimento', 'pontualidade'];
export const AGE = { min: 16, max: 75 };
export const MESSAGE = { min: 10, max: 500 };

export const normalizeRg = (v = '') => String(v).replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
export const isValidRg = (v) => /^\d{6,11}[\dX]$/.test(normalizeRg(v));

const cleanName = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');

const toMinutes = (hhmm) => {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm ?? '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

function fail(errors) {
  if (Object.keys(errors).length) {
    throw new HttpError(400, 'VALIDATION', 'Dados inválidos.', errors);
  }
}

export function parseEmployee(body = {}) {
  const errors = {};
  const nome = cleanName(body.nome);
  if (nome.split(' ').length < 2 || nome.length > 120) errors.nome = 'Informe nome e sobrenome.';
  if (!isValidRg(body.rg)) errors.rg = 'RG inválido.';
  const idade = Number(body.idade);
  if (!Number.isInteger(idade) || idade < AGE.min || idade > AGE.max) {
    errors.idade = `A idade deve estar entre ${AGE.min} e ${AGE.max} anos.`;
  }
  if (!['sim', 'nao'].includes(body.cnh)) errors.cnh = 'Informe se possui carteira de motorista.';
  if (!ROLES.includes(body.cargo)) errors.cargo = 'Cargo inválido.';
  fail(errors);
  return { nome, rg: normalizeRg(body.rg), idade, cnh: body.cnh, cargo: body.cargo };
}

/** Exige os 7 dias, cada um com { ativo, inicio, fim }; dias ativos precisam de fim depois do início. */
export function parseAvailability(body = {}) {
  const input = body.disponibilidade;
  const errors = {};
  if (!input || typeof input !== 'object') {
    throw new HttpError(400, 'VALIDATION', 'Dados inválidos.', { disponibilidade: 'Obrigatório.' });
  }
  const result = {};
  for (const dia of DAYS) {
    const d = input[dia];
    if (!d || typeof d.ativo !== 'boolean' || Number.isNaN(toMinutes(d.inicio)) || Number.isNaN(toMinutes(d.fim))) {
      errors[dia] = 'Use { ativo, inicio, fim } com horários HH:MM.';
    } else if (d.ativo && toMinutes(d.fim) <= toMinutes(d.inicio)) {
      errors[dia] = 'O horário final precisa ser depois do inicial.';
    } else {
      result[dia] = { ativo: d.ativo, inicio: d.inicio, fim: d.fim };
    }
  }
  fail(errors);
  return result;
}

export function parseFeedback(body = {}) {
  const errors = {};
  const nome = cleanName(body.nome);
  if (nome.length > 80) errors.nome = 'Use no máximo 80 caracteres.';
  if (!FEEDBACK_TYPES.includes(body.tipo)) errors.tipo = 'Tipo inválido.';
  const nota = Number(body.nota);
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) errors.nota = 'A nota deve ser de 1 a 5.';

  const categorias = {};
  for (const [id, value] of Object.entries(body.categorias ?? {})) {
    const n = Number(value);
    if (!FEEDBACK_CATEGORIES.includes(id) || !Number.isInteger(n) || n < 1 || n > 5) {
      errors.categorias = 'Categorias inválidas.';
      break;
    }
    categorias[id] = n;
  }

  const mensagem = String(body.mensagem ?? '').trim();
  if (mensagem.length < MESSAGE.min || mensagem.length > MESSAGE.max) {
    errors.mensagem = `A mensagem deve ter de ${MESSAGE.min} a ${MESSAGE.max} caracteres.`;
  }
  fail(errors);
  return { nome, tipo: body.tipo, nota, categorias, mensagem };
}

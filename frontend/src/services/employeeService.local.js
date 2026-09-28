/**
 * Serviço de funcionários — MODO LOCAL (dados no navegador, sem servidor).
 * Usado quando VITE_API_URL não está definida. Mesmo contrato do modo API.
 */
import { DAYS, DEFAULT_WINDOW } from '../utils/constants';
import { hashRg, rgTail } from '../utils/rg';
import { persistent, sessionStore } from './storage';
import { ServiceError } from './errors';

const EMPLOYEES_KEY = 'magicpizza:funcionarios:v1';
const SESSION_KEY = 'magicpizza:sessao:v1';


const emptyAvailability = () =>
  Object.fromEntries(DAYS.map((d) => [d.id, { ativo: false, ...DEFAULT_WINDOW }]));

/** Nunca expõe o identificador do RG para a interface. */
const toPublic = ({ rgHash, ...rest }) => rest;

const readAll = () => persistent.read(EMPLOYEES_KEY, []);

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export async function registerEmployee({ nome, rg, idade, cnh, cargo }) {
  const rgHash = await hashRg(rg);
  const list = readAll();
  if (list.some((e) => e.rgHash === rgHash)) {
    throw new ServiceError('RG_DUPLICATE', 'Este RG já está cadastrado.');
  }
  const employee = {
    id: newId(),
    nome: nome.trim().replace(/\s+/g, ' '),
    rgHash,
    rgFinal: rgTail(rg),
    idade: Number(idade),
    cnh,
    cargo,
    disponibilidade: emptyAvailability(),
    criadoEm: new Date().toISOString(),
  };
  persistent.write(EMPLOYEES_KEY, [...list, employee]);
  return toPublic(employee);
}

export async function loginWithRg(rg) {
  const rgHash = await hashRg(rg);
  const found = readAll().find((e) => e.rgHash === rgHash);
  if (!found) throw new ServiceError('NOT_FOUND', 'RG não encontrado.');
  sessionStore.write(SESSION_KEY, found.id);
  return toPublic(found);
}

export function getSessionEmployee() {
  const id = sessionStore.read(SESSION_KEY, null);
  if (!id) return null;
  const found = readAll().find((e) => e.id === id);
  return found ? toPublic(found) : null;
}

export function logout() {
  sessionStore.remove(SESSION_KEY);
}

export async function saveAvailability(employeeId, disponibilidade) {
  const list = readAll();
  const index = list.findIndex((e) => e.id === employeeId);
  if (index === -1) throw new ServiceError('NOT_FOUND', 'Funcionário não encontrado.');
  const updated = { ...list[index], disponibilidade };
  const next = [...list];
  next[index] = updated;
  persistent.write(EMPLOYEES_KEY, next);
  return toPublic(updated);
}

/** Lista pública de funcionários (nunca inclui o identificador do RG). */
export async function listEmployees() {
  return readAll().map(toPublic);
}

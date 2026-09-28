/** Serviço de funcionários — MODO API. Mesmas assinaturas do modo local. */
import { MANAGER_TOKEN_KEY, TOKEN_KEY, request } from './api';
import { sessionStore } from './storage';

const EMPLOYEE_KEY = 'magicpizza:sessao-api:v1';

export async function registerEmployee({ nome, rg, idade, cnh, cargo }) {
  const data = await request('/api/employees', {
    method: 'POST',
    body: { nome, rg, idade: Number(idade), cnh, cargo },
  });
  return data.employee;
}

export async function loginWithRg(rg) {
  const { token, employee } = await request('/api/auth/login', { method: 'POST', body: { rg } });
  sessionStore.write(TOKEN_KEY, token);
  sessionStore.write(EMPLOYEE_KEY, employee);
  return employee;
}

export function getSessionEmployee() {
  return sessionStore.read(TOKEN_KEY, null) ? sessionStore.read(EMPLOYEE_KEY, null) : null;
}

export function logout() {
  sessionStore.remove(TOKEN_KEY);
  sessionStore.remove(EMPLOYEE_KEY);
}

// O servidor identifica o funcionário pelo token; o id só existe para manter a assinatura.
export async function saveAvailability(_employeeId, disponibilidade) {
  const { employee } = await request('/api/employees/me/availability', {
    method: 'PUT',
    body: { disponibilidade },
    tokenKey: TOKEN_KEY,
  });
  sessionStore.write(EMPLOYEE_KEY, employee);
  return employee;
}

/** Só funciona com o token de gestor (ver managerService). */
export async function listEmployees() {
  const data = await request('/api/manager/team', { tokenKey: MANAGER_TOKEN_KEY });
  return data.employees;
}

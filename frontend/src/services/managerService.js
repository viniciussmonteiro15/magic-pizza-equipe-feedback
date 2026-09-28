/**
 * Acesso do gestor à aba Gestão.
 * - Modo API: o servidor valida o código (MANAGER_PASSWORD) e devolve um token.
 * - Modo local: compara com LOCAL_MANAGER_CODE, que fica visível no código do
 *   navegador. Serve para demonstração, não para proteger dados de verdade.
 */
import { LOCAL_MANAGER_CODE } from '../utils/constants';
import { MANAGER_TOKEN_KEY, USE_API, request } from './api';
import { ServiceError } from './errors';
import { sessionStore } from './storage';

const LOCAL_FLAG = 'magicpizza:gestor-local:v1';
const key = () => (USE_API ? MANAGER_TOKEN_KEY : LOCAL_FLAG);

export const isManagerSession = () => Boolean(sessionStore.read(key(), null));

export async function loginManager(code) {
  const value = String(code ?? '').trim();
  if (!value) throw new ServiceError('INVALID_CODE', 'Informe o código de acesso.');

  if (USE_API) {
    const { token } = await request('/api/manager/login', { method: 'POST', body: { codigo: value } });
    sessionStore.write(MANAGER_TOKEN_KEY, token);
    return;
  }
  if (value !== LOCAL_MANAGER_CODE) throw new ServiceError('INVALID_CODE', 'Código incorreto.');
  sessionStore.write(LOCAL_FLAG, true);
}

export function logoutManager() {
  sessionStore.remove(key());
}

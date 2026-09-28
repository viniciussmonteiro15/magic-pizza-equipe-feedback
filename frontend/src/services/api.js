import { ServiceError } from './errors';
import { sessionStore } from './storage';

/** Se VITE_API_URL estiver definida, a aplicação usa o servidor; senão, o modo local. */
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const USE_API = Boolean(API_URL);

export const TOKEN_KEY = 'magicpizza:token:v1';
export const MANAGER_TOKEN_KEY = 'magicpizza:token-gestor:v1';

/** Chamada JSON à API. Erros viram ServiceError com o código e a mensagem do servidor. */
export async function request(path, { method = 'GET', body, tokenKey } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenKey ? sessionStore.read(tokenKey, null) : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ServiceError('NETWORK', 'Não foi possível falar com o servidor. Verifique sua conexão.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && tokenKey) sessionStore.remove(tokenKey); // token vencido
    throw new ServiceError(
      data?.error?.code ?? `HTTP_${res.status}`,
      data?.error?.message ?? 'Erro inesperado no servidor.',
      res.status
    );
  }
  return data;
}

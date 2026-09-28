/** Serviço de feedback — MODO API. Mesmas assinaturas do modo local. */
import { request } from './api';

export async function listFeedback() {
  const data = await request('/api/feedback');
  return data.feedback;
}

export async function addFeedback({ nome, tipo, nota, categorias, mensagem }) {
  // Igual ao modo local: categorias sem nota não vão para o servidor.
  const rated = Object.fromEntries(Object.entries(categorias ?? {}).filter(([, v]) => v > 0));
  const data = await request('/api/feedback', {
    method: 'POST',
    body: { nome, tipo, nota, categorias: rated, mensagem },
  });
  return data.feedback;
}

import crypto from 'node:crypto';

/** Chave de busca do RG: HMAC com segredo do servidor, então o banco sozinho não revela o RG. */
export const rgLookup = (normalizedRg, pepper) =>
  crypto.createHmac('sha256', pepper).update(`rg:${normalizedRg}`).digest('hex');

const sign = (body, secret) => crypto.createHmac('sha256', secret).update(body).digest('base64url');

/** Comparação em tempo constante, mesmo com tamanhos diferentes. */
export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function signToken(payload, secret, ttlSeconds) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  return `${body}.${sign(body, secret)}`;
}

/** Devolve o payload se a assinatura e a validade estiverem corretas; senão null. */
export function verifyToken(token, secret) {
  if (typeof token !== 'string') return null;
  const [body, signature, extra] = token.split('.');
  if (!body || !signature || extra !== undefined) return null;
  if (!safeEqual(signature, sign(body, secret))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

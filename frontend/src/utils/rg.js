/** Remove pontos, traços e espaços; letras ficam em maiúsculas. */
export function normalizeRg(value = '') {
  return String(value).replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
}

/** 7 a 12 caracteres: dígitos, com X opcional no final. */
export function isValidRg(value) {
  return /^\d{6,11}[\dX]$/.test(normalizeRg(value));
}

/** Últimos 3 caracteres, usados apenas para exibição mascarada. */
export function rgTail(value) {
  return normalizeRg(value).slice(-3);
}

/**
 * Gera um identificador de busca a partir do RG, para não gravá-lo em texto puro.
 * Atenção: RG tem pouca entropia, então isto é ofuscação e não segurança.
 * Em produção, a verificação deve acontecer no backend.
 */
export async function hashRg(value) {
  const normalized = normalizeRg(value);
  const subtle = globalThis.crypto?.subtle;
  // crypto.subtle só existe em contextos seguros (https ou localhost).
  if (!subtle) return `plain:${normalized}`;
  const bytes = new TextEncoder().encode(`magic-pizza:${normalized}`);
  const digest = await subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

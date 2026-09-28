import { HttpError } from '../utils/errors.js';
import { verifyToken } from '../utils/security.js';

/** Exige "Authorization: Bearer <token>" válido e com o papel esperado. */
export function requireRole(role, secret) {
  return (req, _res, next) => {
    const header = req.get('authorization') ?? '';
    const payload = header.startsWith('Bearer ') ? verifyToken(header.slice(7), secret) : null;
    if (!payload) return next(new HttpError(401, 'UNAUTHORIZED', 'Sessão inválida ou expirada. Entre novamente.'));
    if (payload.role !== role) return next(new HttpError(403, 'FORBIDDEN', 'Sem permissão para esta ação.'));
    req.auth = payload;
    return next();
  };
}

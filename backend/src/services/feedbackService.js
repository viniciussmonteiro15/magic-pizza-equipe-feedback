import crypto from 'node:crypto';
import { parseFeedback } from '../utils/validation.js';

export function createFeedbackService({ repo }) {
  return {
    list: () => repo.listRecent(),
    create: (body) => repo.create({ id: crypto.randomUUID(), ...parseFeedback(body) }),
  };
}

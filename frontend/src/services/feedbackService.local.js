/**
 * Serviço de feedback — MODO LOCAL (dados no navegador, sem servidor).
 */
import { SEED_DEMO_DATA } from '../utils/constants';
import { persistent } from './storage';

const KEY = 'magicpizza:feedback:v1';

const SEED = [
  {
    id: 'seed-1',
    nome: 'Helena Martins',
    tipo: 'elogio',
    nota: 5,
    categorias: { pizzas: 5, atendimento: 5, pontualidade: 4 },
    mensagem:
      'Fizemos o aniversário do meu pai em casa e a equipe se organizou muito bem. O pizzaiolo ficou de olho no forno o tempo todo e as pizzas chegavam quentes à mesa.',
    criadoEm: '2026-09-19T21:40:00-03:00',
  },
  {
    id: 'seed-2',
    nome: 'Rogério Tavares',
    tipo: 'sugestao',
    nota: 4,
    categorias: { pizzas: 5, atendimento: 4, pontualidade: 3 },
    mensagem:
      'As pizzas doces foram o ponto alto da noite. Sugiro avisar por mensagem quando a equipe estiver a caminho, porque chegaram uns 15 minutos depois do combinado.',
    criadoEm: '2026-09-14T22:10:00-03:00',
  },
  {
    id: 'seed-3',
    nome: '',
    tipo: 'reclamacao',
    nota: 2,
    categorias: { pizzas: 3, atendimento: 2, pontualidade: 2 },
    mensagem:
      'Éramos 30 convidados e a segunda leva de sabores demorou mais do que esperávamos. A equipe foi educada, mas faltou alguém para reforçar o atendimento.',
    criadoEm: '2026-09-08T20:15:00-03:00',
  },
  {
    id: 'seed-4',
    nome: 'Camila Prado',
    tipo: 'elogio',
    nota: 5,
    categorias: { pizzas: 5, atendimento: 5 },
    mensagem: 'Atendimento impecável do começo ao fim. Os garçons cuidaram das crianças com muita paciência.',
    criadoEm: '2026-09-02T19:30:00-03:00',
  },
  {
    id: 'seed-5',
    nome: 'Diego Ferraz',
    tipo: 'sugestao',
    nota: 4,
    categorias: { pizzas: 4, atendimento: 5, pontualidade: 4 },
    mensagem: 'Gostaria de ver mais opções sem lactose entre os sabores salgados.',
    criadoEm: '2026-08-24T18:05:00-03:00',
  },
];

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function load() {
  const stored = persistent.read(KEY, null);
  if (stored) return stored;
  const initial = SEED_DEMO_DATA ? SEED : [];
  persistent.write(KEY, initial);
  return initial;
}

const byNewest = (a, b) => new Date(b.criadoEm) - new Date(a.criadoEm);

export async function listFeedback() {
  return [...load()].sort(byNewest);
}

export async function addFeedback({ nome, tipo, nota, categorias, mensagem }) {
  const rated = Object.fromEntries(Object.entries(categorias ?? {}).filter(([, v]) => v > 0));
  const entry = {
    id: newId(),
    nome: nome.trim().replace(/\s+/g, ' '),
    tipo,
    nota,
    categorias: rated,
    mensagem: mensagem.trim(),
    criadoEm: new Date().toISOString(),
  };
  persistent.write(KEY, [entry, ...load()]);
  return entry;
}

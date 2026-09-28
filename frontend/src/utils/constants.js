/** Abas principais da aplicação. */
export const TABS = [
  { id: 'equipe', label: 'Equipe' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'gestao', label: 'Gestão' },
];

/* ---------- Equipe ---------- */
export const ROLES = [
  { value: 'garcom', label: 'Garçom', description: 'Atendimento e serviço à mesa' },
  { value: 'pizzaiolo', label: 'Pizzaiolo', description: 'Preparo das pizzas e forno' },
  { value: 'ambos', label: 'Ambos', description: 'Atua nas duas funções' },
];

export const YES_NO = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
];

export const AGE_LIMITS = { min: 16, max: 75 };

export const DAYS = [
  { id: 'seg', label: 'Segunda-feira' },
  { id: 'ter', label: 'Terça-feira' },
  { id: 'qua', label: 'Quarta-feira' },
  { id: 'qui', label: 'Quinta-feira' },
  { id: 'sex', label: 'Sexta-feira' },
  { id: 'sab', label: 'Sábado' },
  { id: 'dom', label: 'Domingo' },
];

export const TIME_PRESETS = [
  { id: 'almoco', label: 'Almoço', inicio: '11:00', fim: '15:00' },
  { id: 'tarde', label: 'Tarde', inicio: '14:00', fim: '18:00' },
  { id: 'noite', label: 'Noite', inicio: '18:00', fim: '23:00' },
  { id: 'dia', label: 'Dia todo', inicio: '11:00', fim: '23:00' },
];

export const DEFAULT_WINDOW = { inicio: '18:00', fim: '23:00' };

/** Janela exibida na linha do tempo semanal (10h às 24h). */
export const TIMELINE = { startHour: 10, endHour: 24, tickEvery: 2 };

/* ---------- Feedback ---------- */
export const FEEDBACK_TYPES = [
  { value: 'elogio', label: 'Elogio', plural: 'Elogios' },
  { value: 'sugestao', label: 'Sugestão', plural: 'Sugestões' },
  { value: 'reclamacao', label: 'Reclamação', plural: 'Reclamações' },
];

export const FEEDBACK_CATEGORIES = [
  { id: 'pizzas', label: 'Sabor das pizzas' },
  { id: 'atendimento', label: 'Atendimento da equipe' },
  { id: 'pontualidade', label: 'Pontualidade' },
];

export const MESSAGE_LIMIT = 500;
export const MESSAGE_MIN = 10;

/** Enquanto não houver backend, popula avaliações de exemplo na primeira visita. */
export const SEED_DEMO_DATA = true;

export const roleLabel = (value) => ROLES.find((r) => r.value === value)?.label ?? '';

/* ---------- Gestão ---------- */
/**
 * Código de acesso da aba Escala no MODO LOCAL (sem backend).
 * Fica visível no código do navegador, então serve apenas para demonstração.
 * Com o backend ligado (VITE_API_URL), quem valida é o servidor (MANAGER_PASSWORD).
 */
export const LOCAL_MANAGER_CODE = 'magic2026';

export const COVERAGE_ROLES = [
  { value: 'garcom', label: 'Garçons' },
  { value: 'pizzaiolo', label: 'Pizzaiolos' },
];

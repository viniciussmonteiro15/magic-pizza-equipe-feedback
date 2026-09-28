export function toMinutes(hhmm) {
  if (typeof hhmm !== 'string' || !/^\d{1,2}:\d{2}$/.test(hhmm)) return NaN;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (!h && !m) return '0 h';
  if (!m) return `${h} h`;
  if (!h) return `${m} min`;
  return `${h} h ${m} min`;
}

/** Minutos disponíveis em um dia (0 se inativo ou inválido). */
export function windowMinutes(day) {
  if (!day?.ativo) return 0;
  const diff = toMinutes(day.fim) - toMinutes(day.inicio);
  return Number.isFinite(diff) && diff > 0 ? diff : 0;
}

/** Posição (em %) da barra dentro da linha do tempo. */
export function timelinePosition(day, { startHour, endHour }) {
  const start = startHour * 60;
  const end = endHour * 60;
  const clamp = (v) => Math.min(Math.max(Number.isFinite(v) ? v : start, start), end);
  const a = clamp(toMinutes(day.inicio));
  const b = clamp(toMinutes(day.fim));
  return {
    left: ((a - start) / (end - start)) * 100,
    width: (Math.max(b - a, 0) / (end - start)) * 100,
  };
}

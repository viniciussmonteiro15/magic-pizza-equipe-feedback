import { FEEDBACK_CATEGORIES } from './constants';

export function summarize(items) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const acc = Object.fromEntries(FEEDBACK_CATEGORIES.map((c) => [c.id, { sum: 0, n: 0 }]));
  let sum = 0;

  items.forEach((item) => {
    distribution[item.nota] += 1;
    sum += item.nota;
    FEEDBACK_CATEGORIES.forEach((c) => {
      const v = item.categorias?.[c.id];
      if (v) {
        acc[c.id].sum += v;
        acc[c.id].n += 1;
      }
    });
  });

  return {
    total: items.length,
    average: items.length ? sum / items.length : 0,
    distribution,
    categories: FEEDBACK_CATEGORIES.map((c) => ({
      ...c,
      count: acc[c.id].n,
      average: acc[c.id].n ? acc[c.id].sum / acc[c.id].n : null,
    })),
  };
}

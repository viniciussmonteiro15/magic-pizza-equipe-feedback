import { DAYS } from './constants';
import { windowMinutes } from './time';

/** "Ambos" conta como garçom e como pizzaiolo. */
const isWaiter = (e) => e.cargo === 'garcom' || e.cargo === 'ambos';
const isPizzaiolo = (e) => e.cargo === 'pizzaiolo' || e.cargo === 'ambos';

export const isAvailableOn = (employee, dayId) => windowMinutes(employee.disponibilidade?.[dayId]) > 0;

/**
 * Para cada dia da semana: quantas pessoas estão disponíveis, quantas em cada
 * função e qual função está descoberta.
 */
export function computeCoverage(employees) {
  return DAYS.map((day) => {
    const available = employees.filter((e) => isAvailableOn(e, day.id));
    const garcons = available.filter(isWaiter).length;
    const pizzaiolos = available.filter(isPizzaiolo).length;
    let gap = null;
    if (garcons === 0 && pizzaiolos === 0) gap = 'Sem equipe';
    else if (garcons === 0) gap = 'Falta garçom';
    else if (pizzaiolos === 0) gap = 'Falta pizzaiolo';
    return { id: day.id, label: day.label, total: available.length, garcons, pizzaiolos, gap };
  });
}

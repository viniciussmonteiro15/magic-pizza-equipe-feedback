import { DAYS, roleLabel } from '../../utils/constants';
import { isAvailableOn } from '../../utils/coverage';
import Tag from '../ui/Tag';

/**
 * Grade semanal: uma linha por funcionário, uma coluna por dia.
 * `coverage` (sempre da equipe inteira) alimenta o rodapé; `employees` é a
 * lista já filtrada por função.
 */
export default function AvailabilityGrid({ employees, coverage }) {
  return (
    <div className="grid-scroll" tabIndex={0} role="region" aria-label="Grade de disponibilidade semanal">
      <table className="avail-grid">
        <caption className="sr-only">Disponibilidade da equipe por dia da semana</caption>
        <thead>
          <tr>
            <th scope="col" className="avail-grid__person-col">
              Funcionário
            </th>
            {DAYS.map((d) => (
              <th key={d.id} scope="col">
                <abbr title={d.label}>{d.label.slice(0, 3)}</abbr>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <th scope="row" className="avail-grid__person-col">
                <span className="avail-grid__name">{emp.nome}</span>
                <span className="avail-grid__role">{roleLabel(emp.cargo)}</span>
              </th>
              {DAYS.map((d) => {
                const on = isAvailableOn(emp, d.id);
                const w = emp.disponibilidade?.[d.id];
                return (
                  <td key={d.id} className={on ? 'is-on' : ''}>
                    {on ? (
                      <span className="avail-grid__slot">
                        {w.inicio}–{w.fim}
                      </span>
                    ) : (
                      <>
                        <span aria-hidden="true" className="avail-grid__off">
                          —
                        </span>
                        <span className="sr-only">Indisponível</span>
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <th scope="row" className="avail-grid__person-col">
              Cobertura do dia
            </th>
            {coverage.map((c) => (
              <td key={c.id} className="avail-grid__coverage">
                <span>Garçons: {c.garcons}</span>
                <span>Pizzaiolos: {c.pizzaiolos}</span>
                {c.gap && <Tag tone="danger">{c.gap}</Tag>}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

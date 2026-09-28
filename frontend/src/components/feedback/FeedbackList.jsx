import { useMemo, useState } from 'react';
import { FEEDBACK_TYPES } from '../../utils/constants';
import EmptyState from '../ui/EmptyState';
import FeedbackCard from './FeedbackCard';

const FILTERS = [{ value: 'todos', label: 'Todos' }, ...FEEDBACK_TYPES.map((t) => ({ value: t.value, label: t.plural }))];

/** Lista de avaliações com filtro por tipo. */
export default function FeedbackList({ items }) {
  const [filter, setFilter] = useState('todos');

  const filtered = useMemo(
    () => (filter === 'todos' ? items : items.filter((i) => i.tipo === filter)),
    [items, filter]
  );

  return (
    <div className="feedback-list">
      <div className="feedback-list__filters" role="group" aria-label="Filtrar avaliações por tipo">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`filter-chip ${filter === f.value ? 'is-active' : ''}`}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhuma avaliação por aqui" description="Assim que chegarem novas mensagens deste tipo, elas aparecem nesta lista." />
      ) : (
        <ul className="feedback-list__items">
          {filtered.map((item) => (
            <li key={item.id}>
              <FeedbackCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

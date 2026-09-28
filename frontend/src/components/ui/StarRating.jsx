import { useId } from 'react';

const LABELS = { 1: 'Muito ruim', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Excelente' };

/**
 * Seletor de nota por estrelas, navegável por teclado (radiogroup real,
 * não apenas botões com ícone) e com rótulo textual sempre visível.
 */
export default function StarRating({ value, onChange, size = 'md', name, ariaLabel = 'Nota geral' }) {
  const groupId = useId();
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={`stars stars--${size}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const id = `${groupId}-${n}`;
        const checked = value === n;
        return (
          <span key={n} className="stars__item">
            <input
              type="radio"
              id={id}
              name={name}
              value={n}
              checked={checked}
              onChange={() => onChange(n)}
              className="stars__input"
            />
            <label htmlFor={id} className="stars__star" title={LABELS[n]}>
              <span aria-hidden="true">★</span>
            </label>
          </span>
        );
      })}
      {value > 0 && <span className="stars__caption">{LABELS[value]}</span>}
    </div>
  );
}

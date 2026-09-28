/**
 * Grupo de opções exclusivas (rádios estilizados como cartões/pílulas).
 * `layout="cards"` mostra descrição abaixo do rótulo; `layout="pills"` é compacto.
 */
export default function ChoiceGroup({ id, name, options, value, onChange, layout = 'cards', ariaProps = {} }) {
  return (
    <div role="radiogroup" aria-labelledby={`${id}-label`} className={`choice-group choice-group--${layout}`} {...ariaProps}>
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label key={opt.value} className={`choice ${checked ? 'is-checked' : ''}`}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="choice__input"
            />
            <span className="choice__label">{opt.label}</span>
            {layout === 'cards' && opt.description && (
              <span className="choice__desc">{opt.description}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}

/**
 * Rótulo + campo + texto de erro, com os atributos ARIA de validação
 * já conectados. `children` recebe o input/select controlado pelo pai.
 */
export default function Field({ id, label, error, hint, required, children }) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
        {required && (
          <span aria-hidden="true" className="field__required">
            {' '}
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-required': required || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

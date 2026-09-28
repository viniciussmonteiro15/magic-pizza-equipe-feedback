/**
 * Botão com três variantes visuais. `as="a"` renderiza um link estilizado
 * como botão (útil para âncoras entre abas).
 */
export default function Button({
  variant = 'primary',
  as: Component = 'button',
  className = '',
  type,
  ...props
}) {
  const resolvedType = Component === 'button' ? type ?? 'button' : type;
  return (
    <Component
      className={`btn btn--${variant} ${className}`.trim()}
      type={resolvedType}
      {...props}
    />
  );
}

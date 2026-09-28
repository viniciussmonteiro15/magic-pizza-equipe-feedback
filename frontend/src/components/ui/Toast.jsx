/** Notificação temporária no canto da tela; sempre anunciada por leitores de tela. */
export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast--${toast.tone ?? 'ok'}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}

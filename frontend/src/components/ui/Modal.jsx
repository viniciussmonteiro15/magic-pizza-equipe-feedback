import { useDialog } from '../../hooks/useDialog';

/**
 * Wrapper de <dialog> nativo: foco preso, Esc e clique fora já funcionam
 * de graça (comportamento do próprio elemento HTML).
 */
export default function Modal({ isOpen, onClose, titleId, className = '', children }) {
  const { dialogRef, handleBackdropClick } = useDialog(isOpen, onClose);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`modal ${className}`.trim()}
      onClick={handleBackdropClick}
      onCancel={onClose}
    >
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </dialog>
  );
}

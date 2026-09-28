import { useCallback, useEffect, useRef } from 'react';

/**
 * Controla um <dialog> nativo: foco automático, fechamento pela tecla Esc
 * e pelo clique no backdrop já vêm de graça do elemento nativo.
 */
export function useDialog(isOpen, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (isOpen && !node.open) node.showModal();
    if (!isOpen && node.open) node.close();
  }, [isOpen]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const handleClose = () => onClose?.();
    node.addEventListener('close', handleClose);
    return () => node.removeEventListener('close', handleClose);
  }, [onClose]);

  const handleBackdropClick = useCallback((event) => {
    if (event.target === ref.current) ref.current.close();
  }, []);

  return { dialogRef: ref, handleBackdropClick };
}

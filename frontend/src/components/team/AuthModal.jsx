import { useEffect, useId, useState } from 'react';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Modal from '../ui/Modal';
import { ServiceError, loginWithRg } from '../../services/employeeService';

/** Login por RG apresentado em um diálogo modal, acessível via teclado. */
export default function AuthModal({ isOpen, onClose, onLoggedIn }) {
  const titleId = useId();
  const [rg, setRg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRg('');
      setError('');
    }
  }, [isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!rg.trim()) {
      setError('Informe seu RG.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const employee = await loginWithRg(rg);
      onLoggedIn(employee);
    } catch (err) {
      setError(err instanceof ServiceError ? err.message : 'Não foi possível entrar agora.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={titleId}>
      <div className="modal__header">
        <h2 id={titleId} className="modal__title">
          Entrar
        </h2>
        <button type="button" className="modal__close" aria-label="Fechar" onClick={onClose}>
          ×
        </button>
      </div>

      <p className="auth-modal__lead">Digite o RG usado no cadastro para acessar sua disponibilidade.</p>

      <form onSubmit={handleSubmit} noValidate>
        <Field id="login-rg" label="RG" error={error}>
          {(props) => (
            <input
              {...props}
              className="input"
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder="Ex.: 45.678.901-2"
              value={rg}
              onChange={(e) => setRg(e.target.value)}
            />
          )}
        </Field>

        <Button type="submit" className="auth-modal__submit" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="auth-modal__foot">Ainda não tem cadastro? Preencha o formulário na aba Equipe primeiro.</p>
    </Modal>
  );
}

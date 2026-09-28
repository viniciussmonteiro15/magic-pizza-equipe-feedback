import { useState } from 'react';
import Button from '../ui/Button';
import Field from '../ui/Field';
import { ServiceError } from '../../services/errors';
import { loginManager } from '../../services/managerService';

/** Pede o código do gestor antes de mostrar os dados da equipe. */
export default function ManagerGate({ onUnlocked }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await loginManager(code);
      onUnlocked();
    } catch (err) {
      setError(err instanceof ServiceError ? err.message : 'Não foi possível validar o código agora.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card manager-gate" onSubmit={handleSubmit} noValidate>
      <h2 className="card__title">Acesso restrito</h2>
      <p className="card__desc">Esta área mostra a disponibilidade de toda a equipe. Informe o código de gestor.</p>
      <Field id="manager-code" label="Código de acesso" error={error}>
        {(props) => (
          <input
            {...props}
            className="input"
            type="password"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        )}
      </Field>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Verificando…' : 'Acessar'}
      </Button>
    </form>
  );
}

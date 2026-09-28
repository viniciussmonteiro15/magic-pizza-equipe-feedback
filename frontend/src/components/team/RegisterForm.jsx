import { useState } from 'react';
import Button from '../ui/Button';
import ChoiceGroup from '../ui/ChoiceGroup';
import Field from '../ui/Field';
import { ROLES, YES_NO } from '../../utils/constants';
import { validateEmployee } from '../../utils/validators';
import { ServiceError, registerEmployee } from '../../services/employeeService';

const EMPTY_FORM = { nome: '', rg: '', idade: '', cnh: '', cargo: '' };

/**
 * Cadastro de funcionário. Ao concluir, chama `onRegistered` com os dados
 * públicos (sem RG) para o painel abrir o login automaticamente.
 */
export default function RegisterForm({ onRegistered }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validateEmployee(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const employee = await registerEmployee(form);
      setForm(EMPTY_FORM);
      onRegistered(employee);
    } catch (err) {
      setSubmitError(err instanceof ServiceError ? err.message : 'Não foi possível cadastrar agora. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      <Field id="reg-nome" label="Nome completo" error={errors.nome} required>
        {(props) => (
          <input
            {...props}
            className="input"
            type="text"
            autoComplete="name"
            placeholder="Ex.: Marina Souza Lima"
            value={form.nome}
            onChange={(e) => setField('nome')(e.target.value)}
          />
        )}
      </Field>

      <div className="register-form__row">
        <Field id="reg-rg" label="RG" hint="Você usará este número para entrar depois" error={errors.rg} required>
          {(props) => (
            <input
              {...props}
              className="input"
              type="text"
              inputMode="numeric"
              placeholder="Ex.: 45.678.901-2"
              value={form.rg}
              onChange={(e) => setField('rg')(e.target.value)}
            />
          )}
        </Field>

        <Field id="reg-idade" label="Idade" error={errors.idade} required>
          {(props) => (
            <input
              {...props}
              className="input"
              type="number"
              inputMode="numeric"
              min="16"
              max="75"
              placeholder="Ex.: 24"
              value={form.idade}
              onChange={(e) => setField('idade')(e.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="register-form__field-block">
        <p id="reg-cnh-label" className="field__label">
          Possui carteira de motorista? <span aria-hidden="true" className="field__required">*</span>
        </p>
        <ChoiceGroup
          id="reg-cnh"
          name="cnh"
          layout="pills"
          options={YES_NO}
          value={form.cnh}
          onChange={setField('cnh')}
        />
        {errors.cnh && (
          <p className="field__error" role="alert">
            {errors.cnh}
          </p>
        )}
      </div>

      <div className="register-form__field-block">
        <p id="reg-cargo-label" className="field__label">
          Cargo / função <span aria-hidden="true" className="field__required">*</span>
        </p>
        <ChoiceGroup
          id="reg-cargo"
          name="cargo"
          layout="cards"
          options={ROLES}
          value={form.cargo}
          onChange={setField('cargo')}
        />
        {errors.cargo && (
          <p className="field__error" role="alert">
            {errors.cargo}
          </p>
        )}
      </div>

      {submitError && (
        <p className="register-form__submit-error" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Cadastrando…' : 'Cadastrar e continuar'}
      </Button>
    </form>
  );
}

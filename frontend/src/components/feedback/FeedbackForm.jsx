import { useId, useState } from 'react';
import Button from '../ui/Button';
import ChoiceGroup from '../ui/ChoiceGroup';
import Field from '../ui/Field';
import StarRating from '../ui/StarRating';
import { FEEDBACK_CATEGORIES, FEEDBACK_TYPES, MESSAGE_LIMIT } from '../../utils/constants';
import { validateFeedback } from '../../utils/validators';

const EMPTY_FORM = { nome: '', tipo: '', nota: 0, categorias: {}, mensagem: '' };

/** Formulário de feedback do cliente: tipo, nota geral, categorias opcionais e mensagem. */
export default function FeedbackForm({ onSubmitFeedback }) {
  const headingId = useId();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  function setCategoryRating(id, nota) {
    setForm((prev) => ({ ...prev, categorias: { ...prev.categorias, [id]: nota } }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validateFeedback(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      const ok = await onSubmitFeedback(form);
      if (ok !== false) setForm(EMPTY_FORM);
    } finally {
      setSubmitting(false);
    }
  }

  const remaining = MESSAGE_LIMIT - form.mensagem.length;

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate aria-labelledby={headingId}>
      <h2 id={headingId} className="card__title">
        Deixe sua avaliação
      </h2>
      <p className="card__desc">Sua opinião ajuda a equipe a melhorar o próximo rodízio.</p>

      <div className="feedback-form__grid">
        <Field id="fb-nome" label="Seu nome" hint="Opcional — deixe em branco para enviar de forma anônima">
          {(props) => (
            <input
              {...props}
              className="input"
              type="text"
              placeholder="Ex.: Ana Paula"
              value={form.nome}
              onChange={(e) => setField('nome')(e.target.value)}
            />
          )}
        </Field>

        <div className="feedback-form__field-block">
          <p className="field__label">
            Tipo de mensagem <span aria-hidden="true" className="field__required">*</span>
          </p>
          <ChoiceGroup id="fb-tipo" name="tipo" layout="pills" options={FEEDBACK_TYPES} value={form.tipo} onChange={setField('tipo')} />
          {errors.tipo && (
            <p className="field__error" role="alert">
              {errors.tipo}
            </p>
          )}
        </div>
      </div>

      <div className="feedback-form__field-block">
        <p className="field__label">
          Nota geral <span aria-hidden="true" className="field__required">*</span>
        </p>
        <StarRating name="nota-geral" value={form.nota} onChange={setField('nota')} />
        {errors.nota && (
          <p className="field__error" role="alert">
            {errors.nota}
          </p>
        )}
      </div>

      <div className="feedback-form__categories">
        <p className="field__label">Avalie itens específicos (opcional)</p>
        <ul className="feedback-form__category-list">
          {FEEDBACK_CATEGORIES.map((cat) => (
            <li key={cat.id} className="feedback-form__category-row">
              <span>{cat.label}</span>
              <StarRating
                name={`nota-${cat.id}`}
                size="sm"
                ariaLabel={`Nota para ${cat.label}`}
                value={form.categorias[cat.id] ?? 0}
                onChange={(n) => setCategoryRating(cat.id, n)}
              />
            </li>
          ))}
        </ul>
      </div>

      <Field id="fb-mensagem" label="Mensagem" error={errors.mensagem} required>
        {(props) => (
          <textarea
            {...props}
            className="input feedback-form__textarea"
            rows={4}
            maxLength={MESSAGE_LIMIT}
            placeholder="Conte como foi sua experiência com o rodízio…"
            value={form.mensagem}
            onChange={(e) => setField('mensagem')(e.target.value)}
          />
        )}
      </Field>
      <p className="feedback-form__counter">{remaining} caracteres restantes</p>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Enviando…' : 'Enviar avaliação'}
      </Button>
    </form>
  );
}

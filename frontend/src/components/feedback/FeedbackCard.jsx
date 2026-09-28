import { FEEDBACK_TYPES } from '../../utils/constants';
import { formatDate, initials } from '../../utils/format';
import Tag from '../ui/Tag';

const TONE_BY_TYPE = { elogio: 'ok', sugestao: 'info', reclamacao: 'danger' };

export default function FeedbackCard({ item }) {
  const typeLabel = FEEDBACK_TYPES.find((t) => t.value === item.tipo)?.label ?? item.tipo;

  return (
    <article className="feedback-card">
      <div className="feedback-card__avatar" aria-hidden="true">
        {item.nome ? initials(item.nome) : '—'}
      </div>

      <div className="feedback-card__body">
        <div className="feedback-card__head">
          <div>
            <p className="feedback-card__name">{item.nome || 'Avaliação anônima'}</p>
            <p className="feedback-card__date">{formatDate(item.criadoEm)}</p>
          </div>
          <div className="feedback-card__badges">
            <Tag tone={TONE_BY_TYPE[item.tipo] ?? 'neutral'}>{typeLabel}</Tag>
            <span className="feedback-card__stars" aria-label={`Nota ${item.nota} de 5`}>
              {'★'.repeat(item.nota)}
              <span className="feedback-card__stars-empty">{'★'.repeat(5 - item.nota)}</span>
            </span>
          </div>
        </div>

        <p className="feedback-card__message">{item.mensagem}</p>
      </div>
    </article>
  );
}

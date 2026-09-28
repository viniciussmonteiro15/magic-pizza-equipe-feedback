import { formatScore } from '../../utils/format';

/** Painel-resumo: nota média, distribuição de estrelas e médias por categoria. */
export default function FeedbackStats({ stats }) {
  const maxCount = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className="card feedback-stats">
      <div className="feedback-stats__headline">
        <p className="feedback-stats__score">{stats.total ? formatScore(stats.average) : '—'}</p>
        <div>
          <div className="feedback-stats__stars" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= Math.round(stats.average) ? 'is-filled' : ''}>
                ★
              </span>
            ))}
          </div>
          <p className="feedback-stats__count">
            {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
          </p>
        </div>
      </div>

      <ul className="feedback-stats__distribution" aria-label="Distribuição de notas">
        {[5, 4, 3, 2, 1].map((n) => (
          <li key={n}>
            <span className="feedback-stats__dist-label">{n}★</span>
            <span className="feedback-stats__dist-track">
              <span
                className="feedback-stats__dist-bar"
                style={{ width: `${(stats.distribution[n] / maxCount) * 100}%` }}
              />
            </span>
            <span className="feedback-stats__dist-value">{stats.distribution[n]}</span>
          </li>
        ))}
      </ul>

      {stats.categories.some((c) => c.average != null) && (
        <ul className="feedback-stats__categories">
          {stats.categories.map((cat) => (
            <li key={cat.id}>
              <span>{cat.label}</span>
              <span className="feedback-stats__cat-score">{cat.average != null ? formatScore(cat.average) : '—'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

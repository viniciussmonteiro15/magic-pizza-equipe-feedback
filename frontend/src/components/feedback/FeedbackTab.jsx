import { useMemo } from 'react';
import PageHeader from '../layout/PageHeader';
import { summarize } from '../../utils/feedbackStats';
import { useFeedback } from '../../hooks/useFeedback';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';
import FeedbackStats from './FeedbackStats';

export default function FeedbackTab({ showToast }) {
  const { items, loading, error, add } = useFeedback();
  const stats = useMemo(() => summarize(items), [items]);

  async function handleSubmit(form) {
    try {
      await add(form);
      showToast('Obrigado! Sua avaliação foi enviada.');
      return true;
    } catch (err) {
      showToast(err.message || 'Não foi possível enviar agora. Tente novamente.', 'danger');
      return false; // o formulário mantém o que a pessoa digitou
    }
  }

  return (
    <section id="feedback" className="tab-panel" aria-labelledby="feedback-heading">
      <div className="container">
        <PageHeader
          eyebrow="Feedback"
          title="O que estão dizendo do rodízio"
          lead="Avaliações enviadas pelos clientes depois de cada evento, reunidas em um só lugar para orientar a equipe."
        />

        <div className="feedback-layout">
          <div className="feedback-layout__main">
            <div className="card">
              <FeedbackForm onSubmitFeedback={handleSubmit} />
            </div>

            <h2 className="feedback-layout__list-heading">Avaliações recentes</h2>
            {loading ? (
              <p className="feedback-layout__loading">Carregando avaliações…</p>
            ) : error ? (
              <p className="feedback-layout__loading" role="alert">
                {error.message || 'Não foi possível carregar as avaliações.'}
              </p>
            ) : (
              <FeedbackList items={items} />
            )}
          </div>

          <aside className="feedback-layout__aside" aria-label="Resumo das avaliações">
            <FeedbackStats stats={stats} />
          </aside>
        </div>
      </div>
    </section>
  );
}

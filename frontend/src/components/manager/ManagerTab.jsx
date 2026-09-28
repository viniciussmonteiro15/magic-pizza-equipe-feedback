import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../layout/PageHeader';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import AvailabilityGrid from './AvailabilityGrid';
import ManagerGate from './ManagerGate';
import { computeCoverage } from '../../utils/coverage';
import { useTeam } from '../../hooks/useTeam';
import { isManagerSession, logoutManager } from '../../services/managerService';

const ROLE_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'garcom', label: 'Garçons' },
  { value: 'pizzaiolo', label: 'Pizzaiolos' },
];

/** Grade da equipe. Só é montada depois que o gestor se identifica. */
function ManagerBoard({ refreshKey, onLock }) {
  const { employees, loading, error } = useTeam(refreshKey);
  const [filter, setFilter] = useState('todos');

  const coverage = useMemo(() => computeCoverage(employees), [employees]);

  // "Ambos" aparece nos dois filtros.
  const visible = useMemo(
    () => (filter === 'todos' ? employees : employees.filter((e) => e.cargo === filter || e.cargo === 'ambos')),
    [employees, filter]
  );

  // Token do gestor vencido: volta para a tela de código.
  useEffect(() => {
    if (error?.status === 401) onLock();
  }, [error, onLock]);

  if (error && error.status !== 401) {
    return (
      <p className="manager__error" role="alert">
        {error.message}
      </p>
    );
  }
  if (loading) return <p className="manager__loading">Carregando equipe…</p>;

  if (employees.length === 0) {
    return (
      <EmptyState
        title="Nenhum funcionário cadastrado"
        description="Quando a equipe se cadastrar e registrar a disponibilidade, a grade aparece aqui."
        action={
          <Button as="a" href="#equipe" variant="secondary">
            Ir para o cadastro
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="manager__filters" role="group" aria-label="Filtrar por função">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`filter-chip ${filter === f.value ? 'is-active' : ''}`}
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <span className="manager__count">
          {visible.length} {visible.length === 1 ? 'pessoa' : 'pessoas'}
        </span>
        <Button variant="ghost" className="manager__lock" onClick={onLock}>
          Bloquear
        </Button>
      </div>

      <AvailabilityGrid employees={visible} coverage={coverage} />
      <p className="manager__note">A linha de cobertura considera sempre a equipe inteira, independentemente do filtro.</p>
    </>
  );
}

/**
 * Visão do gestor: disponibilidade de toda a equipe numa grade semanal.
 * `refreshKey` muda quando alguém salva a disponibilidade, para recarregar.
 */
export default function ManagerTab({ refreshKey }) {
  const [unlocked, setUnlocked] = useState(isManagerSession);

  function lock() {
    logoutManager();
    setUnlocked(false);
  }

  return (
    <section id="gestao" className="tab-panel" aria-labelledby="gestao-heading">
      <div className="container">
        <PageHeader
          eyebrow="Gestão"
          title="Escala da semana"
          lead="Veja quem está disponível em cada dia e onde falta cobertura de garçom ou pizzaiolo."
        />
        <div className="manager">
          {unlocked ? (
            <ManagerBoard refreshKey={refreshKey} onLock={lock} />
          ) : (
            <ManagerGate onUnlocked={() => setUnlocked(true)} />
          )}
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import PageHeader from '../layout/PageHeader';
import AuthModal from './AuthModal';
import RegisterForm from './RegisterForm';
import AvailabilityPanel from './AvailabilityPanel';
import { roleLabel } from '../../utils/constants';
import Tag from '../ui/Tag';

/**
 * Aba Equipe. Sem sessão: mostra o cadastro. Com sessão: mostra o painel
 * de disponibilidade. `authModalOpen` é controlado pelo App (botão "Entrar"
 * no cabeçalho também abre o mesmo modal).
 */
export default function TeamTab({ employee, onLogin, onSaved, authModalOpen, onOpenAuth, onCloseAuth, showToast }) {
  const [justRegistered, setJustRegistered] = useState(null);

  function handleRegistered(newEmployee) {
    setJustRegistered(newEmployee);
    onOpenAuth();
  }

  function handleLoggedIn(loggedEmployee) {
    onLogin(loggedEmployee);
    onCloseAuth();
    setJustRegistered(null);
    showToast(`Bem-vindo(a), ${loggedEmployee.nome.split(' ')[0]}!`);
  }

  function handleSaved(updated) {
    onSaved(updated);
    showToast('Disponibilidade salva com sucesso.');
  }

  return (
    <section id="equipe" className="tab-panel" aria-labelledby="equipe-heading">
      <div className="container">
        <PageHeader
          eyebrow="Equipe"
          title={employee ? 'Sua disponibilidade' : 'Cadastro de funcionários'}
          lead={
            employee
              ? 'Marque os dias e horários em que você pode trabalhar nesta semana.'
              : 'Cadastre-se para acessar seu painel de disponibilidade. Depois de cadastrado, entre com seu RG.'
          }
        />

        {employee ? (
          <div className="card team-panel">
            <div className="team-panel__profile">
              <div>
                <h2 className="card__title">{employee.nome}</h2>
                <div className="team-panel__tags">
                  <Tag tone="brass">{roleLabel(employee.cargo)}</Tag>
                  <Tag>{employee.idade} anos</Tag>
                  {employee.cnh === 'sim' && <Tag tone="info">Tem CNH</Tag>}
                </div>
              </div>
            </div>
            <AvailabilityPanel employee={employee} onSaved={handleSaved} />
          </div>
        ) : (
          <div className="card">
            {justRegistered && (
              <p className="team-panel__notice" role="status">
                Cadastro de {justRegistered.nome.split(' ')[0]} concluído. Entre com seu RG para continuar.
              </p>
            )}
            <RegisterForm onRegistered={handleRegistered} />
          </div>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={onCloseAuth} onLoggedIn={handleLoggedIn} />
    </section>
  );
}

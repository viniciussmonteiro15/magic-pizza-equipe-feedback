import { useCallback, useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import TeamTab from './components/team/TeamTab';
import FeedbackTab from './components/feedback/FeedbackTab';
import ManagerTab from './components/manager/ManagerTab';
import { useHashTab } from './hooks/useHashTab';
import { useSession } from './hooks/useSession';

export default function App() {
  const activeTab = useHashTab();
  const { employee, login, logout, update } = useSession();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  // Sobe a cada disponibilidade salva, para a aba Gestão recarregar.
  const [teamVersion, setTeamVersion] = useState(0);

  const showToast = useCallback((message, tone = 'ok') => {
    setToast({ message, tone, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleLogout() {
    logout();
    showToast('Sessão encerrada.');
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>

      <Header
        activeTab={activeTab}
        employee={employee}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main id="conteudo">
        <TeamTab
          employee={employee}
          onLogin={login}
          onSaved={(emp) => {
            update(emp);
            setTeamVersion((v) => v + 1);
          }}
          authModalOpen={authModalOpen}
          onOpenAuth={() => setAuthModalOpen(true)}
          onCloseAuth={() => setAuthModalOpen(false)}
          showToast={showToast}
        />
        <FeedbackTab showToast={showToast} />
        <ManagerTab refreshKey={teamVersion} />
      </main>

      <Footer />
      <Toast toast={toast} />
    </>
  );
}

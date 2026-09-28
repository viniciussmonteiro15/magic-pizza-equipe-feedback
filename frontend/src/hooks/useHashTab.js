import { useEffect, useState } from 'react';
import { TABS } from '../utils/constants';

const isTab = (id) => TABS.some((t) => t.id === id);
const readHash = () => {
  const id = window.location.hash.replace('#', '');
  return isTab(id) ? id : TABS[0].id;
};

/** Sincroniza a aba ativa com o hash da URL (#equipe, #feedback). */
export function useHashTab() {
  const [tab, setTab] = useState(readHash);

  useEffect(() => {
    const onChange = () => {
      const id = window.location.hash.replace('#', '');
      if (isTab(id)) setTab(id); // ignora âncoras como #conteudo
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return tab;
}

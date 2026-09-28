import { useEffect, useState } from 'react';
import { listEmployees } from '../services/employeeService';

/** Carrega a equipe inteira, recarregando sempre que `refreshKey` mudar. */
export function useTeam(refreshKey) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    listEmployees()
      .then((list) => {
        if (!active) return;
        setEmployees([...list].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
        setError(null);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { employees, loading, error };
}

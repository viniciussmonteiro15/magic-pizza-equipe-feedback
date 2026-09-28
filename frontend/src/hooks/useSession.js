import { useCallback, useState } from 'react';
import { getSessionEmployee, logout as logoutService } from '../services/employeeService';

/** Mantém o funcionário autenticado na sessão do navegador (aba atual). */
export function useSession() {
  const [employee, setEmployee] = useState(getSessionEmployee);

  const login = useCallback((emp) => setEmployee(emp), []);

  const logout = useCallback(() => {
    logoutService();
    setEmployee(null);
  }, []);

  const update = useCallback((emp) => setEmployee(emp), []);

  return { employee, login, logout, update };
}

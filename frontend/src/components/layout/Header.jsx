import { TABS } from '../../utils/constants';
import { firstName } from '../../utils/format';
import Button from '../ui/Button';

/**
 * Cabeçalho fixo com navegação por âncoras reais (funciona sem JS e com
 * "abrir em nova guia"). O estado de sessão decide o botão da direita.
 */
export default function Header({ activeTab, employee, onOpenAuth, onLogout }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#equipe" className="header__brand">
          <span className="header__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="30" height="30">
              <circle cx="16" cy="16" r="13.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 3v26M3 16h26M8 8l16 16M24 8L8 24" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
          <span className="header__wordmark">
            Magic Pizza
            <span className="header__submark">Painel interno</span>
          </span>
        </a>

        <nav className="header__nav" aria-label="Seções do painel">
          <ul>
            {TABS.map((tab) => (
              <li key={tab.id}>
                <a href={`#${tab.id}`} aria-current={activeTab === tab.id ? 'page' : undefined}>
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          {employee ? (
            <div className="header__session">
              <span className="header__session-name">Olá, {firstName(employee.nome)}</span>
              <Button variant="ghost" onClick={onLogout}>
                Sair
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={onOpenAuth}>
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

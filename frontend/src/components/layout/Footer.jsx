export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>© {new Date().getFullYear()} Magic Pizza — Rodízio Domiciliar</p>
        <p className="footer__note">Painel de uso interno da equipe</p>
      </div>
    </footer>
  );
}

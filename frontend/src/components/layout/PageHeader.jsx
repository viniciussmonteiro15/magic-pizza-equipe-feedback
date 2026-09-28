export default function PageHeader({ eyebrow, title, lead }) {
  return (
    <div className="page-header">
      {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {lead && <p className="page-lead">{lead}</p>}
    </div>
  );
}

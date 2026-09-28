export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__desc">{description}</p>}
      {action}
    </div>
  );
}

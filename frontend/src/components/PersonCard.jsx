import { memo } from 'react';
import { getAvatarColor, getInitials } from '../utils/avatar';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export const PersonCard = memo(function PersonCard({ person, onEdit, onDelete }) {
  const initials = getInitials(person.name);
  const avatarColor = getAvatarColor(person.name);

  return (
    <article className="card person-card h-100 shadow-sm">
      <div className="card-body">
        <div className="person-card-header">
          <div className="person-avatar" style={{ backgroundColor: avatarColor }} aria-hidden="true">
            {initials}
          </div>
          <div className="flex-grow-1 min-width-0">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <h3 className="h6 card-title mb-1 text-truncate">{person.name}</h3>
              {person.fromCache && (
                <span className="badge text-bg-warning cache-badge" title="Served from Redis cache">
                  Redis
                </span>
              )}
            </div>
            <p className="small text-muted mb-0 text-truncate">{person.email}</p>
          </div>
        </div>

        <div className="person-meta-row">
          <span className="person-meta-icon" aria-hidden="true">🎂</span>
          <span>{person.age} years old</span>
        </div>
        <div className="person-meta-row">
          <span className="person-meta-icon" aria-hidden="true">📍</span>
          <span className="text-truncate">{person.address || 'No address'}</span>
        </div>
        <div className="person-meta-row">
          <span className="person-meta-icon" aria-hidden="true">🕐</span>
          <time dateTime={person.updatedOn}>{formatDate(person.updatedOn)}</time>
        </div>
      </div>
      <div className="card-footer bg-transparent d-flex gap-2 border-top pt-3">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm flex-grow-1"
          onClick={() => onEdit(person)}
          aria-label={`Edit ${person.name}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(person)}
          aria-label={`Delete ${person.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
});

import { useEffect, useRef } from 'react';

export function Navbar({ view, onNavigate, personCount }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar shadow-sm" aria-label="Main">
      <div className="container">
        <button
          type="button"
          className="d-flex align-items-center gap-2 btn btn-link text-white text-decoration-none p-0 border-0"
          onClick={() => onNavigate('list')}
        >
          <span className="navbar-brand-mark">PD</span>
          <span className="navbar-brand-text text-white">PersonDataHub</span>
        </button>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <div className="ms-auto d-flex flex-wrap align-items-center gap-2 py-2 py-lg-0">
            <button
              type="button"
              className={`nav-pill ${view === 'list' ? 'active' : ''}`}
              onClick={() => onNavigate('list')}
            >
              Directory
            </button>
            {view === 'list' && (
              <span className="badge rounded-pill text-bg-light text-dark">
                {personCount} {personCount === 1 ? 'person' : 'people'}
              </span>
            )}
            <button type="button" className="btn btn-primary btn-sm px-3" onClick={() => onNavigate('create')}>
              + Add person
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const typeClass =
    toast.type === 'danger' ? 'text-bg-danger' : toast.type === 'success' ? 'text-bg-success' : 'text-bg-primary';

  return (
    <div className="toast-container-fixed position-fixed top-0 end-0 p-3" aria-live="polite" aria-atomic="true">
      <div className={`toast show align-items-center border-0 toast-custom ${typeClass}`} role="alert">
        <div className="d-flex">
          <div className="toast-body fw-medium">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            aria-label="Close notification"
            onClick={onDismiss}
          />
        </div>
      </div>
    </div>
  );
}

export function DeleteModal({ person, onConfirm, onCancel, loading }) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!person) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onCancel();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
      document.body.style.overflow = previousOverflow;
    };
  }, [person, loading, onCancel]);

  if (!person) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deleteLabel"
        ref={dialogRef}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header border-0 pb-0">
              <h2 className="modal-title h5" id="deleteLabel">
                Delete person?
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Close dialog"
                onClick={onCancel}
                disabled={loading}
              />
            </div>
            <div className="modal-body">
              <p className="mb-0 text-secondary">
                Remove <strong className="text-dark">{person.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                ref={cancelRef}
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                {loading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" aria-hidden="true" />
    </>
  );
}

export function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="d-flex align-items-center gap-2 text-muted py-2" role="status" aria-live="polite">
      <div className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

export function ListSkeleton({ count = 6 }) {
  return (
    <div className="row g-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={`skeleton-${i}`} className="col-md-6 col-lg-4">
          <div className="skeleton-card" />
        </div>
      ))}
    </div>
  );
}

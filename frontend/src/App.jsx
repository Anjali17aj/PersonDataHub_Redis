import { useCallback, useMemo, useState } from 'react';
import { personApi } from './services/person-api';
import { usePersons } from './hooks/usePersons';
import { useToast } from './hooks/useToast';
import { EmailLookup } from './components/EmailLookup';
import { PersonCard } from './components/PersonCard';
import { PersonForm } from './components/PersonForm';
import { DeleteModal, ListSkeleton, Navbar, Toast } from './components/Ui';

function matchesSearch(person, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    person.name?.toLowerCase().includes(q) ||
    person.email?.toLowerCase().includes(q) ||
    person.address?.toLowerCase().includes(q)
  );
}

export function App() {
  const { persons, loading, error, reload } = usePersons();
  const { toast, showToast, dismissToast } = useToast();
  const [search, setSearch] = useState('');

  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredPersons = useMemo(
    () => persons.filter((person) => matchesSearch(person, search.trim())),
    [persons, search],
  );

  const navigate = useCallback((next) => {
    setView(next);
    if (next === 'list') setEditing(null);
  }, []);

  const startEdit = useCallback((person) => {
    setEditing(person);
    setView('edit');
  }, []);

  const goToList = useCallback(() => navigate('list'), [navigate]);

  const handleCreate = useCallback(
    async (data) => {
      await personApi.create(data);
      showToast('Person created successfully.', 'success');
      navigate('list');
      await reload();
    },
    [showToast, navigate, reload],
  );

  const handleUpdate = useCallback(
    async (data) => {
      if (!editing) return;
      await personApi.update(editing.id, data);
      showToast('Changes saved.', 'success');
      navigate('list');
      await reload();
    },
    [editing, showToast, navigate, reload],
  );

  const closeDeleteModal = useCallback(() => {
    if (!deleting) setDeleteTarget(null);
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await personApi.delete(deleteTarget.id);
      showToast(`${deleteTarget.name} was deleted.`, 'success');
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'danger');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, showToast, reload]);

  return (
    <div className="app-shell">
      <Navbar view={view} onNavigate={navigate} personCount={persons.length} />
      <Toast toast={toast} onDismiss={dismissToast} />

      <main id="main-content" className="app-main py-4">
        <div className="container">
          {view === 'list' && (
            <header className="page-hero">
              <div className="page-hero-content">
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="tech-badge">MySQL</span>
                  <span className="tech-badge">Redis cache</span>
                </div>
                <p className="small text-muted-hero mb-1">People directory</p>
                <h1 className="h3 mb-2 fw-semibold">Manage your contacts</h1>
                <p className="mb-0 text-muted-hero">
                  Create, search, and update person records with cache-aside lookups.
                </p>
                <div className="hero-stats">
                  <div className="hero-stat">
                    <div className="hero-stat-value">{persons.length}</div>
                    <div className="hero-stat-label">Total people</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-value">{filteredPersons.length}</div>
                    <div className="hero-stat-label">Showing now</div>
                  </div>
                </div>
              </div>
            </header>
          )}

          {(view === 'create' || (view === 'edit' && editing)) && (
            <div className="form-page-header">
              <nav aria-label="Breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={goToList}>
                      Directory
                    </button>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {view === 'create' ? 'Add person' : `Edit ${editing?.name ?? ''}`}
                  </li>
                </ol>
              </nav>
              <h1 className="h4 mb-0">{view === 'create' ? 'Add new person' : `Edit ${editing?.name ?? ''}`}</h1>
            </div>
          )}

          {view === 'create' && (
            <PersonForm onSubmit={handleCreate} onCancel={goToList} submitLabel="Create person" />
          )}

          {view === 'edit' && editing && (
            <PersonForm
              key={editing.id}
              initial={editing}
              onSubmit={handleUpdate}
              onCancel={goToList}
              submitLabel="Save changes"
            />
          )}

          {view === 'list' && (
            <>
              <EmailLookup onEdit={startEdit} onDelete={setDeleteTarget} />

              <section className="section-card" aria-labelledby="list-heading">
                <div className="section-card-header">
                  <div>
                    <h2 id="list-heading" className="section-card-title">
                      All persons
                    </h2>
                    <p className="section-card-subtitle">
                      {loading ? 'Loading records…' : `${filteredPersons.length} of ${persons.length} shown`}
                    </p>
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <div className="search-input-wrap">
                      <span className="search-icon" aria-hidden="true">⌕</span>
                      <input
                        type="search"
                        className="form-control form-control-sm"
                        placeholder="Search name, email, address…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search persons"
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={reload}
                      disabled={loading}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                    <span>{error}</span>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={reload}>
                      Retry
                    </button>
                  </div>
                )}

                {loading && <ListSkeleton />}
                {!loading && !error && persons.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon" aria-hidden="true">👤</div>
                    <h3 className="h5 mb-2">No people yet</h3>
                    <p className="text-secondary mb-3">Add your first contact to get started.</p>
                    <button type="button" className="btn btn-primary" onClick={() => navigate('create')}>
                      Add person
                    </button>
                  </div>
                )}
                {!loading && !error && persons.length > 0 && filteredPersons.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon" aria-hidden="true">⌕</div>
                    <h3 className="h5 mb-2">No matches</h3>
                    <p className="text-secondary mb-3">Try a different search term.</p>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setSearch('')}>
                      Clear search
                    </button>
                  </div>
                )}
                {!loading && filteredPersons.length > 0 && (
                  <div className="row g-3">
                    {filteredPersons.map((person) => (
                      <div key={person.id} className="col-md-6 col-lg-4">
                        <PersonCard person={person} onEdit={startEdit} onDelete={setDeleteTarget} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <footer className="app-footer py-3 mt-auto">
        <div className="container small text-muted text-center">PersonDataHub v1.0.0</div>
      </footer>

      <DeleteModal
        person={deleteTarget}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}

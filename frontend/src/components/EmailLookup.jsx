import { useId, useRef, useState } from 'react';
import { ApiError, personApi } from '../services/person-api';
import { PersonCard } from './PersonCard';
import { LoadingSpinner } from './Ui';

export function EmailLookup({ onEdit, onDelete }) {
  const sectionId = useId();
  const inputId = `${sectionId}-email`;
  const abortRef = useRef(null);

  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(event) {
    event?.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter an email address.');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const person = await personApi.getByEmail(trimmed, { signal: controller.signal });
      setResult(person);
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err instanceof ApiError && err.status === 404) {
        setError('No person found for that email.');
      } else {
        setError(err.message || 'Lookup failed');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  function handleDeleteFromLookup(person) {
    onDelete(person);
    setResult(null);
    setEmail('');
  }

  return (
    <section className="section-card" aria-labelledby={`${sectionId}-title`}>
      <div className="section-card-header mb-3">
        <div>
          <h2 id={`${sectionId}-title`} className="section-card-title">
            Lookup by email
          </h2>
          <p className="section-card-subtitle">Redis cache first, then MySQL on miss.</p>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        <label htmlFor={inputId} className="form-label fw-medium">
          Email address
        </label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0">@</span>
          <input
            id={inputId}
            type="email"
            className="form-control border-start-0 ps-0"
            placeholder="person@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-describedby={`${inputId}-hint`}
          />
          <button type="submit" className="btn btn-primary px-4" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
        <div id={`${inputId}-hint`} className="form-text form-text-hint">
          Press Search or Enter. Cached hits show a Redis badge on the result card.
        </div>
      </form>

      {loading && <LoadingSpinner label="Searching" />}

      {error && !loading && (
        <div className="alert alert-warning mt-3 mb-0" role="alert">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="row mt-3">
          <div className="col-lg-6">
            <PersonCard person={result} onEdit={onEdit} onDelete={handleDeleteFromLookup} />
          </div>
        </div>
      )}
    </section>
  );
}

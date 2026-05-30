import { useEffect, useId, useState } from 'react';

function createEmptyForm() {
  return { name: '', email: '', age: '', address: '' };
}

export function PersonForm({ initial, onSubmit, onCancel, submitLabel }) {
  const formId = useId();
  const [form, setForm] = useState(createEmptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name ?? '',
        email: initial.email ?? '',
        age: String(initial.age ?? ''),
        address: initial.address ?? '',
      });
    } else {
      setForm(createEmptyForm());
    }
    setError(null);
  }, [initial]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const name = form.name.trim();
    const email = form.email.trim();
    const age = Number(form.age);

    if (!name) return 'Name is required.';
    if (!email) return 'Email is required.';
    if (!Number.isFinite(age) || age < 0 || age > 150) return 'Please enter a valid age (0–150).';
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        address: form.address.trim(),
      });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const ageId = `${formId}-age`;
  const addressId = `${formId}-address`;

  return (
    <section className="section-card" aria-labelledby={`${formId}-heading`}>
      <p id={`${formId}-heading`} className="text-muted small mb-4">
        Fields marked with * are required.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor={nameId} className="form-label fw-medium">
              Full name <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id={nameId}
              className="form-control"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Jane Doe"
            />
          </div>

          <div className="col-md-6">
            <label htmlFor={emailId} className="form-label fw-medium">
              Email <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id={emailId}
              type="email"
              className="form-control"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="jane@example.com"
              aria-describedby={`${emailId}-hint`}
            />
            <div id={`${emailId}-hint`} className="form-text form-text-hint">
              Must be unique across all records.
            </div>
          </div>

          <div className="col-md-4">
            <label htmlFor={ageId} className="form-label fw-medium">
              Age <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id={ageId}
              type="number"
              min={0}
              max={150}
              className="form-control"
              required
              value={form.age}
              onChange={(e) => updateField('age', e.target.value)}
            />
          </div>

          <div className="col-md-8">
            <label htmlFor={addressId} className="form-label fw-medium">
              Address
            </label>
            <input
              id={addressId}
              className="form-control"
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="123 Main St, City"
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-end mt-4 pt-3 border-top">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
            {submitting ? (
              <span className="d-inline-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                Saving…
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

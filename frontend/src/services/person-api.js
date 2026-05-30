const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError('Invalid response from server', response.status);
  }
}

async function handleResponse(response) {
  if (response.ok) {
    if (response.status === 204) return null;
    return parseJsonSafe(response);
  }

  let message = `Request failed (${response.status})`;
  try {
    const error = await parseJsonSafe(response);
    if (error?.validationErrors) {
      message = Object.values(error.validationErrors).join(', ');
    } else if (error?.message) {
      message = error.message;
    }
  } catch {
    /* use default message */
  }
  throw new ApiError(message, response.status);
}

async function request(path, options = {}) {
  const { signal, ...init } = options;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Cannot reach the API. Start the backend on http://localhost:8080');
  }
  return handleResponse(response);
}

export const personApi = {
  getAll({ signal, page = 0, size = 100, sort = 'name,asc' } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
    });
    return request(`/api/persons?${params}`, { signal });
  },

  getByEmail(email, { signal } = {}) {
    const params = new URLSearchParams({ email });
    return request(`/api/persons/by-email?${params}`, { signal });
  },

  create(data, { signal } = {}) {
    return request('/api/persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal,
    });
  },

  update(id, data, { signal } = {}) {
    return request(`/api/persons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal,
    });
  },

  delete(id, { signal } = {}) {
    return request(`/api/persons/${id}`, { method: 'DELETE', signal });
  },
};

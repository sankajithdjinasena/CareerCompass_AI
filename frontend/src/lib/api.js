/**
 * api.js
 * ------
 * Thin API client for all CareerCompass auth endpoints.
 * Base URL comes from VITE_API_BASE env variable (default: http://localhost:8000).
 */

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

/**
 * Generic fetch wrapper that throws a descriptive Error on non-2xx responses.
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.detail || data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ------------------------------------------------------------------
// Auth endpoints
// ------------------------------------------------------------------

/**
 * Register with email + password (+ optional name).
 * Returns { token, user }
 */
export const apiRegister = ({ email, password, name }) =>
  request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });

/**
 * Login with email + password.
 * Returns { token, user }
 */
export const apiLogin = ({ email, password }) =>
  request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

/**
 * Sign in / register via Google ID token.
 * `credential` is the raw JWT string from @react-oauth/google's onSuccess callback.
 * Returns { token, user }
 */
export const apiGoogleAuth = (credential) =>
  request('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });

/**
 * Logout — invalidates the server-side session.
 */
export const apiLogout = (token) =>
  request('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

/**
 * Fetch the currently authenticated user.
 * Returns UserResponse (id, email, name, picture, provider, created_at)
 */
export const apiMe = (token) =>
  request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

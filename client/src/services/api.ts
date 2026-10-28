import type { ApiErrorBody } from '@/types';

const rawBase = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
const BASE: string = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let onUnauthorized: (() => void) | null = null;

/**
 * Registers a callback fired once when the session expires mid-use (a 401 on a
 * request other than the initial `/auth/me` probe). Used to clear client auth
 * state and route the user back to login instead of surfacing raw errors.
 */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

function csrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)aurawell_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retried = false,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-CSRF-Token'] = csrfToken();

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection.', 'network_error');
  }

  if (response.status === 204) return undefined as T;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const err = (payload as ApiErrorBody | null)?.error;
    const code = err?.code ?? 'unknown_error';
    // A stale CSRF cookie (e.g. a long-lived tab) can reject a mutation even
    // though the session is valid. Refresh the cookie once and retry.
    if (response.status === 403 && code === 'csrf_invalid' && !retried) {
      await ensureCsrf();
      return request<T>(method, path, body, true);
    }
    // An expired session mid-use should log the user out and bounce them to
    // login, rather than showing a raw "unauthenticated" error. The initial
    // `/auth/me` probe is excluded because a 401 there is the normal
    // "not logged in" signal.
    if (response.status === 401 && !path.startsWith('/auth/') && onUnauthorized) {
      onUnauthorized();
    }
    throw new ApiError(response.status, err?.message ?? 'Something went wrong', code, err?.details);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),
};

/** Ensures the CSRF cookie exists before the first state-changing call. */
export async function ensureCsrf(): Promise<void> {
  await api.get('/csrf');
}

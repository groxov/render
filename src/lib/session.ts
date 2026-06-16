import { AuthSession } from '../types';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearStoredSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function persistSession(session: AuthSession) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session));
}

export function getStoredSession(): AuthSession | null {
  const rawSession = localStorage.getItem(AUTH_USER_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession;

    if (session?.name && (session?.type === 'admin' || session?.type === 'user')) {
      return session;
    }

    return null;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

/**
 * Firebase Authentication via REST API.
 * No Firebase SDK required — uses the Identity Toolkit REST endpoint.
 *
 * Add to .env.local:
 *   NEXT_PUBLIC_FIREBASE_API_KEY=your_web_api_key
 */

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1/accounts';

export interface AuthUser {
  uid: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number; // ms timestamp
}

// ── Sign in ──────────────────────────────────────────────────────────────────

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await fetch(`${AUTH_BASE}:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || 'Login failed';
    throw new Error(friendlyError(msg));
  }

  return {
    uid: data.localId,
    email: data.email,
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + Number(data.expiresIn) * 1000,
  };
}

// ── Token refresh ─────────────────────────────────────────────────────────────

export async function refreshIdToken(refreshToken: string): Promise<AuthUser> {
  const res = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    },
  );

  const data = await res.json();
  if (!res.ok) throw new Error('Session expired. Please log in again.');

  return {
    uid: data.user_id,
    email: data.email || '',
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + Number(data.expires_in) * 1000,
  };
}

// ── Session helpers (localStorage) ───────────────────────────────────────────

const SESSION_KEY = 'clinio_admin_session';

export function saveSession(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function loadSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user: AuthUser = JSON.parse(raw);
    // Consider expired if within 60 s of expiry
    if (user.expiresAt - 60_000 < Date.now()) return null;
    return user;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

// ── Firestore authenticated write helpers ─────────────────────────────────────

export async function getValidToken(user: AuthUser): Promise<{ token: string; user: AuthUser }> {
  if (user.expiresAt - 60_000 > Date.now()) {
    return { token: user.idToken, user };
  }
  const refreshed = await refreshIdToken(user.refreshToken);
  saveSession(refreshed);
  return { token: refreshed.idToken, user: refreshed };
}

// ── Error messages ────────────────────────────────────────────────────────────

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    EMAIL_NOT_FOUND: 'No account found with that email.',
    INVALID_PASSWORD: 'Incorrect password.',
    INVALID_EMAIL: 'Invalid email address.',
    USER_DISABLED: 'This account has been disabled.',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many failed attempts. Try again later.',
    INVALID_LOGIN_CREDENTIALS: 'Invalid email or password.',
  };
  return map[code] ?? `Authentication error: ${code}`;
}

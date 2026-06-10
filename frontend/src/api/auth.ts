const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const TOKEN_KEY   = 'portfolio_access_token';
const REFRESH_KEY = 'portfolio_refresh_token';
const USER_KEY    = 'portfolio_user_info';

// ─── 타입 ──────────────────────────────────────────────────────
export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  tokenType:    string;
  id:           number;
  email:        string;
  username:     string;
  organization: string | null;
  githubUrl:    string | null;
  role:         string;
}

export interface UserProfile {
  id:           number;
  email:        string;
  username:     string;
  organization: string | null;
  githubUrl:    string | null;
  role:         string;
  createdAt:    string;
}

// ─── 토큰 스토리지 ────────────────────────────────────────────
export const tokenStorage = {
  save(r: AuthResponse) {
    localStorage.setItem(TOKEN_KEY,   r.accessToken);
    localStorage.setItem(REFRESH_KEY, r.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: r.id, email: r.email, username: r.username,
      organization: r.organization, githubUrl: r.githubUrl, role: r.role,
    }));
  },
  getAccessToken: ()  => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  getUser: (): Omit<UserProfile, 'createdAt'> | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  updateUser(partial: Partial<UserProfile>) {
    const cur = tokenStorage.getUser();
    if (cur) localStorage.setItem(USER_KEY, JSON.stringify({ ...cur, ...partial }));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

// ─── fetch 래퍼 ───────────────────────────────────────────────
async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  });
  if (!res.ok) {
    let msg = '요청에 실패했습니다.';
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

function authReq<T>(path: string, init: RequestInit = {}): Promise<T> {
  return req<T>(path, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${tokenStorage.getAccessToken()}` },
  });
}

// ─── API ──────────────────────────────────────────────────────
export async function signup(params: {
  email: string; password: string; username: string;
  organization?: string; githubUrl?: string;
}): Promise<AuthResponse> {
  const res = await req<AuthResponse>('/auth/signup', {
    method: 'POST', body: JSON.stringify(params),
  });
  tokenStorage.save(res);
  return res;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await req<AuthResponse>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });
  tokenStorage.save(res);
  return res;
}

export function logout() { tokenStorage.clear(); }

export async function getMe(): Promise<UserProfile> {
  return authReq<UserProfile>('/auth/me');
}

export async function updateMe(params: {
  username?: string; organization?: string | null; githubUrl?: string | null;
  currentPassword?: string; newPassword?: string;
}): Promise<UserProfile> {
  const res = await authReq<UserProfile>('/auth/me', {
    method: 'PUT', body: JSON.stringify(params),
  });
  tokenStorage.updateUser(res);
  return res;
}
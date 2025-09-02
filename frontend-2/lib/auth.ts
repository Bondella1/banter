import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API,
  withCredentials: false,
});

// --- small helper to detect token endpoints (absolute or relative) ---
function isTokenEndpoint(url?: string) {
  if (!url) return false;
  try {
    const u = url.startsWith('http') ? new URL(url) : new URL(url, API);
    return /^\/api\/token(?:\/refresh)?$/i.test(u.pathname);
  } catch {
    return false;
  }
}

// Optional helper unchanged
export function attachAuthFromStorage() {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('accessToken');
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

// ### CHANGE 1: use *root axios* for login to avoid header injection ###
export async function login(identifier: string, password: string, useEmail?: boolean) {
  const key = useEmail || identifier.includes('@') ? 'email' : 'username';
  const tokenUrl = `${API}/api/token`; // absolute URL with root axios

  const { data } = await axios.post(tokenUrl, { [key]: identifier, password });

  localStorage.setItem('accessToken', data.access);
  if (data.refresh) localStorage.setItem('refreshToken', data.refresh);

  api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
  return data; // { access, refresh }
}

// Already using root axios here — good.
export async function refreshAccessToken() {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) throw new Error('No refresh token');

  const refreshUrl = `${API}/api/token/refresh`;
  const { data } = await axios.post(refreshUrl, { refresh }); // no Authorization header

  localStorage.setItem('accessToken', data.access);
  if (data.refresh) localStorage.setItem('refreshToken', data.refresh); // rotation
  api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
  return data; // { access, [refresh] }
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  delete api.defaults.headers.common.Authorization;
}

/* ---------- Interceptors ---------- */

// ### CHANGE 2: don't attach Authorization on token endpoints ###
api.interceptors.request.use((config) => {
  if (!isTokenEndpoint(config.url) && typeof window !== 'undefined') {
    const t = localStorage.getItem('accessToken');
    if (t) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${t}`;
      }
    }
  } else if (config.headers?.Authorization) {
    // ensure stripped on /api/token and /api/token/refresh
    delete (config.headers as any).Authorization;
  }
  return config;
});

// ### CHANGE 3: serialize refreshes to avoid rotation races ###
let isRefreshing = false;
let waiters: Array<(t: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (!response) throw error;                 // network error
    if (response.status !== 401) throw error;   // not an auth error
    if (!config || isTokenEndpoint(config.url)) throw error; // don't loop on token endpoints

    // only try once per request
    if (config._retry) throw error;
    (config as any)._retry = true;

    if (isRefreshing) {
      // wait for the in-flight refresh, then retry with the new token
      const newToken = await new Promise<string>((resolve) => waiters.push(resolve));
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    }

    try {
      isRefreshing = true;
      const { access } = await refreshAccessToken();
      // notify queued requests
      waiters.forEach((fn) => fn(access));
      waiters = [];

      // retry the original with fresh token
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access}`;
      return api(config);
    } catch (e) {
      // hard logout on refresh failure
      logout();
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

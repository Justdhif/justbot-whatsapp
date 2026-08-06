import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const API_BASE_URL = 'https://justbot-api.netlify.app/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

// Helper to get stored tokens
export function getAuthTokens() {
  const accessToken = getCookie('access_token');
  const refreshToken = getCookie('refresh_token');
  return {
    accessToken: typeof accessToken === 'string' ? accessToken : null,
    refreshToken: typeof refreshToken === 'string' ? refreshToken : null,
  };
}

// Helper to save tokens
export function setAuthTokens(accessToken: string, refreshToken: string) {
  // Store access token (long lived: 7d) and refresh token (long lived: 365d)
  setCookie('access_token', accessToken, { maxAge: 7 * 24 * 60 * 60, path: '/' });
  setCookie('refresh_token', refreshToken, { maxAge: 365 * 24 * 60 * 60, path: '/' });
}

// Helper to clear tokens
export function clearAuthTokens() {
  deleteCookie('access_token', { path: '/' });
  deleteCookie('refresh_token', { path: '/' });
}

// Core fetch wrapper
export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  let { accessToken, refreshToken } = getAuthTokens();

  // Proactive refresh: if accessToken is missing but refreshToken is available, try refreshing first
  // to avoid sending an unauthenticated request and triggering a 401.
  if (!accessToken && refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const data = refreshData?.data || refreshData;
        if (data && data.accessToken && data.refreshToken) {
          setAuthTokens(data.accessToken, data.refreshToken);
          accessToken = data.accessToken;
          refreshToken = data.refreshToken;
        }
      }
    } catch (e) {
      console.error('Proactive refresh failed:', e);
    }
  }
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(url, fetchOptions);

  // If unauthorized, attempt token refresh once
  if (response.status === 401 && refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const data = refreshData.data || refreshData;
        if (data.accessToken && data.refreshToken) {
          setAuthTokens(data.accessToken, data.refreshToken);
          
          // Retry original request with new access token
          headers.set('Authorization', `Bearer ${data.accessToken}`);
          response = await fetch(url, fetchOptions);
        } else {
          clearAuthTokens();
        }
      } else {
        clearAuthTokens();
      }
    } catch (e) {
      clearAuthTokens();
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errBody = await response.json();
      errorMessage = errBody.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const resJson = await response.json();
  // Standard format might wrap in { data, message, statusCode }
  return resJson;
}

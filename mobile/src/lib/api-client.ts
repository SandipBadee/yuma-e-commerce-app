import { useUserStore } from '../../store/useUserStore';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiRequestOptions = {
  method?: RequestMethod;
  body?: unknown;
  authenticated?: boolean;
  headers?: Record<string, string>;
};

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function getApiBaseUrl() {
  return API_BASE;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, authenticated = false, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (authenticated) {
    const token = useUserStore.getState().token;
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body == null ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let payload: any = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const errorMessage = payload?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage) as Error & { status?: number; data?: unknown };
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload as T;
}

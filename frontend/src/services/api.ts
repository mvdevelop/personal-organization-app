const rawBase = import.meta.env.VITE_API_URL || '';
const API_BASE = rawBase.replace(/\/+$/, '');

interface ApiError {
  status: number
  message: string
  details?: unknown
}

export class ApiClientError extends Error {
  status: number
  details?: unknown

  constructor({ status, message, details }: ApiError) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.details = details
  }
}

export interface ApiOptions {
  signal?: AbortSignal
}

// In-memory token (not localStorage — XSS-safe, cleared on page refresh)
let _authToken: string | null = null

export function setAuthToken(token: string | null): void {
  _authToken = token
}

export function getAuthToken(): string | null {
  return _authToken
}

async function request<T>(
  endpoint: string,
  options: RequestInit & ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  // Send in-memory token as Authorization header (works cross-origin for local dev)
  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`
  }

  const { signal, ...fetchOptions } = options

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    signal,
    credentials: 'include', // httpOnly cookie as fallback for Vercel-to-Vercel
  })

  if (!response.ok) {
    // If 401, session expired or not authenticated — redirect to login
    if (response.status === 401 && !window.location.pathname.includes('/sign-in')) {
      window.location.href = '/sign-in'
      throw new ApiClientError({ status: 401, message: 'Sessão expirada' })
    }

    let body: { error?: string; details?: unknown }
    try {
      body = await response.json()
    } catch {
      body = { error: 'Erro inesperado do servidor' }
    }
    throw new ApiClientError({
      status: response.status,
      message: body.error || `HTTP ${response.status}`,
      details: body.details,
    })
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string, opts?: ApiOptions) =>
    request<T>(endpoint, { method: 'GET', ...opts }),

  post: <T>(endpoint: string, data?: unknown, opts?: ApiOptions) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...opts,
    }),

  put: <T>(endpoint: string, data?: unknown, opts?: ApiOptions) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...opts,
    }),

  patch: <T>(endpoint: string, data?: unknown, opts?: ApiOptions) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...opts,
    }),

  delete: <T>(endpoint: string, opts?: ApiOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...opts }),
}

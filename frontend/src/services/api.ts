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

// Token storage: sessionStorage (survives F5, cleared on tab close)
// For same-origin (Vercel), httpOnly cookie handles auth automatically.
const TOKEN_KEY = 'auth_token'

export function setAuthToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token)
  } else {
    sessionStorage.removeItem(TOKEN_KEY)
  }
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

async function request<T>(
  endpoint: string,
  options: RequestInit & ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  // Send session token as Authorization header (works cross-origin for local dev)
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const { signal, ...fetchOptions } = options

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    signal,
    credentials: 'include', // httpOnly cookie as fallback for Vercel-to-Vercel
  })

  if (!response.ok) {
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

const rawBase = import.meta.env.VITE_API_URL || ''
const API_BASE = rawBase.replace(/\/+$/, '')
const CSRF_ENDPOINT = '/api/csrf-token'
const CSRF_HEADER = 'x-csrf-token'
const TOKEN_KEY = 'auth_token'

let csrfToken: string | null = null

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

export function resetCsrfToken(): void {
  csrfToken = null
}

function isMutation(method: string | undefined): boolean {
  return method !== undefined && !['GET', 'HEAD', 'OPTIONS'].includes(method)
}

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken

  const response = await fetch(`${API_BASE}${CSRF_ENDPOINT}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      message: 'Não foi possível obter o token CSRF',
    })
  }

  const body = await response.json() as { csrfToken?: string }
  if (!body.csrfToken) {
    throw new ApiClientError({ status: response.status, message: 'Token CSRF ausente' })
  }

  csrfToken = body.csrfToken
  return csrfToken
}

async function parseError(response: Response): Promise<{ error?: string; code?: string; details?: unknown }> {
  try {
    return await response.json() as { error?: string; code?: string; details?: unknown }
  } catch {
    return { error: 'Erro inesperado do servidor' }
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

async function request<T>(
  endpoint: string,
  options: RequestInit & ApiOptions = {},
  retryCsrf = true,
): Promise<T> {
  const method = options.method?.toUpperCase()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  const token = getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (isMutation(method)) headers[CSRF_HEADER] = await getCsrfToken()

  const { signal, ...fetchOptions } = options
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    signal,
    credentials: 'include',
  })

  if (response.ok) return readResponse<T>(response)

  const body = await parseError(response)
  if (
    isMutation(method) &&
    retryCsrf &&
    response.status === 403 &&
    body.code === 'CSRF_FAILURE'
  ) {
    resetCsrfToken()
    return request(endpoint, options, false)
  }

  throw new ApiClientError({
    status: response.status,
    message: body.error || `HTTP ${response.status}`,
    details: body.details,
  })
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

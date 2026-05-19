const API_URL = process.env.NEXT_PUBLIC_API_URL!

class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail)
  }
}

async function refreshTokens(): Promise<boolean> {
  const res = await fetch('/api/auth/refresh', { method: 'POST' })
  return res.ok
}

async function request<T>(
  path: string,
  options: RequestInit,
  retried = false,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (res.status === 401 && !retried) {
    const refreshed = await refreshTokens()
    if (refreshed) return request<T>(path, options, true)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, body.detail ?? res.statusText)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json()
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined })
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}

export { ApiError }

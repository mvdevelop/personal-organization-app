/**
 * Simple in-memory cache with TTL.
 * Useful for reducing DB queries in serverless environments
 * where the same data may be requested multiple times within seconds.
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

const DEFAULT_TTL_MS = 30_000 // 30 seconds

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.data as T
}

export function setCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function clearCache(): void {
  store.clear()
}

/** Create a cache key from user ID and context name */
export function cacheKey(userId: string, context: string): string {
  return `${userId}:${context}`
}

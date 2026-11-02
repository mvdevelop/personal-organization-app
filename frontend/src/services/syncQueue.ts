export interface SyncQueueItem {
  id: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  body?: unknown
  timestamp: number
  retryCount: number
  lastError?: string
  failed?: boolean
}

export const SYNC_QUEUE_KEY = '@orgapp:sync-queue'
export const MAX_RETRIES = 3

function notifySyncQueueChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('orgapp:sync-queue-changed'))
  }
}

export function enqueueSync(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): string {
  const id = crypto.randomUUID()
  const queue = getSyncQueue()
  queue.push({
    ...item,
    id,
    timestamp: Date.now(),
    retryCount: 0,
  })
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  notifySyncQueueChanged()
  return id
}

export function getSyncQueue(): SyncQueueItem[] {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSyncQueueItem)
  } catch {
    return []
  }
}

function isSyncQueueItem(item: unknown): item is SyncQueueItem {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Partial<SyncQueueItem>
  return (
    typeof candidate.id === 'string' &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(candidate.method || '') &&
    typeof candidate.url === 'string' &&
    typeof candidate.timestamp === 'number' &&
    typeof candidate.retryCount === 'number'
  )
}

export function removeSyncItem(id: string): void {
  const queue = getSyncQueue().filter(item => item.id !== id)
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  notifySyncQueueChanged()
}

export function incrementRetry(id: string, error?: string): void {
  const queue = getSyncQueue().map(item =>
    item.id === id
      ? {
        ...item,
        retryCount: item.retryCount + 1,
        lastError: error,
        failed: item.retryCount + 1 >= MAX_RETRIES,
      }
      : item,
  )
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  notifySyncQueueChanged()
}

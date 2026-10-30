/**
 * IndexedDB wrapper for offline data storage.
 * Stores cached versions of user data (tasks, notes, habits, goals, etc.)
 * so the app remains functional offline.
 */

const DB_NAME = 'SmartAgendaOffline'
const DB_VERSION = 1
const STORES = ['tasks', 'notes', 'habits', 'goals', 'subjects', 'dashboard'] as const
type StoreName = typeof STORES[number]

interface DBInstance {
  db: IDBDatabase | null
  version: number
}

const instance: DBInstance = { db: null, version: DB_VERSION }

function openDB(): Promise<IDBDatabase> {
  if (instance.db) return Promise.resolve(instance.db)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('IndexedDB error:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      instance.db = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: '_id' })
        }
      }
    }
  })
}

/**
 * Save data to the offline store for a given entity type.
 * Each entity must have a unique `_id` field.
 */
export async function saveToStore<T extends { _id: string }>(
  storeName: StoreName,
  items: T[],
): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)

    // Clear old data and save fresh
    store.clear()
    for (const item of items) {
      store.put(item)
    }

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Load data from the offline store.
 */
export async function loadFromStore<T = any>(storeName: StoreName): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Sync queue — stores pending API mutations while offline.
 * These are processed when connectivity is restored.
 */
interface SyncQueueItem {
  id: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  body?: unknown
  timestamp: number
  retryCount: number
}

const SYNC_QUEUE_KEY = '@orgapp:sync-queue'
const MAX_RETRIES = 3

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
  return id
}

export function getSyncQueue(): SyncQueueItem[] {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function removeSyncItem(id: string): void {
  const queue = getSyncQueue().filter(item => item.id !== id)
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
}

export function incrementRetry(id: string): void {
  const queue = getSyncQueue().map(item =>
    item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item,
  )
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
}

/**
 * Process all items in the sync queue.
 * Called when online status returns to 'online'.
 */
export async function processSyncQueue(): Promise<void> {
  const queue = getSyncQueue()
  if (queue.length === 0) return

  console.log(`[Sync] Processing ${queue.length} pending items`)

  for (const item of queue) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: item.body ? JSON.stringify(item.body) : undefined,
        credentials: 'include',
      })
      removeSyncItem(item.id)
    } catch {
      if (item.retryCount >= MAX_RETRIES) {
        removeSyncItem(item.id)
        console.warn(`[Sync] Failed to sync item ${item.id} after ${MAX_RETRIES} retries`)
      } else {
        incrementRetry(item.id)
      }
    }
  }
}

/**
 * Listen for online/offline events and process sync queue.
 */
export function initOfflineSync(): void {
  window.addEventListener('online', () => {
    console.log('[Offline] Connection restored — processing sync queue')
    processSyncQueue()
  })

  window.addEventListener('offline', () => {
    console.log('[Offline] Connection lost — entering offline mode')
  })
}

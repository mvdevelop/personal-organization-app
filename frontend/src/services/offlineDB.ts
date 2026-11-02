/**
 * IndexedDB wrapper for offline data storage.
 * Stores cached versions of user data (tasks, notes, habits, goals, etc.)
 * so the app remains functional offline.
 */

import { api, ApiClientError } from './api'
import {
  enqueueSync,
  getSyncQueue,
  incrementRetry,
  removeSyncItem,
  type SyncQueueItem,
  MAX_RETRIES,
} from './syncQueue'

export { enqueueSync, getSyncQueue, incrementRetry, removeSyncItem }
export type { SyncQueueItem }

const RETRY_BACKOFF_MS = 1000

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

    store.clear()
    for (const item of items) {
      store.put(item)
    }

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Load data from the offline store. */
export async function loadFromStore<T = unknown>(storeName: StoreName): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

function getRetryDelay(retryCount: number): number {
  return RETRY_BACKOFF_MS * 2 ** Math.max(0, retryCount - 1)
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return `${error.status}: ${error.message}`
  return error instanceof Error ? error.message : 'Falha desconhecida ao sincronizar'
}

/**
 * Process all items in the sync queue using the authenticated API client.
 * Failed items remain visible in the queue until the retry limit is reached.
 */
export async function processSyncQueue(): Promise<void> {
  const queue = getSyncQueue()
  if (queue.length === 0) return

  for (const item of queue) {
    try {
      await api.request(item.url, {
        method: item.method,
        body: item.body === undefined ? undefined : JSON.stringify(item.body),
      })
      removeSyncItem(item.id)
    } catch (error: unknown) {
      const retryCount = item.retryCount + 1
      const message = getErrorMessage(error)

      if (retryCount >= MAX_RETRIES) {
        incrementRetry(item.id, message)
        console.warn(`[Sync] Item ${item.id} kept for manual review after ${MAX_RETRIES} attempts`)
      } else {
        incrementRetry(item.id, message)
        await new Promise(resolve => window.setTimeout(resolve, getRetryDelay(retryCount)))
      }
    }
  }
}

/** Listen for online/offline events and process the sync queue. */
export function initOfflineSync(): () => void {
  const onOnline = () => {
    void processSyncQueue()
  }
  const onOffline = () => {
    window.dispatchEvent(new CustomEvent('orgapp:offline-state-changed'))
  }

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  if (navigator.onLine) void processSyncQueue()

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

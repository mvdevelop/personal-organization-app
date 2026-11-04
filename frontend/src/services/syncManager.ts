/**
 * Sync Manager with idempotency and conflict resolution
 * Ensures offline changes are safely synced without duplication or data loss
 */

import { api, ApiClientError } from './api';
import { getSyncQueue, incrementRetry, removeSyncItem, type SyncQueueItem, MAX_RETRIES } from './syncQueue';

const RETRY_BACKOFF_MS = 1000;

/** Generate idempotency key for a request */
export function generateIdempotencyKey(method: string, url: string, body?: unknown): string {
  const content = JSON.stringify({ method, url, body });
  // Simple hash-like key (in production, use crypto.subtle.digest)
  return `idempotency-${btoa(content).slice(0, 32)}`;
}

/** Get retry delay with exponential backoff */
function getRetryDelay(retryCount: number): number {
  return RETRY_BACKOFF_MS * 2 ** Math.max(0, retryCount - 1);
}

/** Get user-friendly error message */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 409) return 'Conflito de dados detectado. Sincronização abortada.';
    if (error.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (error.status === 429) return 'Rate limit atingido. Tentando novamente...';
    return `${error.status}: ${error.message}`;
  }
  return error instanceof Error ? error.message : 'Falha desconhecida ao sincronizar';
}

/** Check if request conflicts with server state */
async function checkConflict(item: SyncQueueItem): Promise<boolean> {
  // For PUT/PATCH requests, verify if resource was modified server-side
  if (!['PUT', 'PATCH'].includes(item.method)) return false;

  try {
    // Extract resource ID from URL (assumes /api/resource/:id pattern)
    const match = item.url.match(/\/(\w+)\/([^/?]+)$/);
    if (!match) return false;

    const [, resource, id] = match;
    const serverItem = await api.request(`/api/${resource}/${id}`, { method: 'GET' }) as { updatedAt?: string } | null;

    if (!serverItem) return false;
    const localItem = item.body as { updatedAt?: string } | undefined;

    // Simple conflict detection: compare updatedAt timestamps
    if (serverItem.updatedAt && localItem?.updatedAt) {
      const serverTime = new Date(serverItem.updatedAt).getTime();
      const localTime = new Date(localItem.updatedAt).getTime();

      if (serverTime > localTime) {
        console.warn(`[Sync] Conflict detected for ${item.url}: server version is newer`);
        return true;
      }
    }
  } catch (error) {
    console.error('[Sync] Failed to check conflict:', error);
    // Don't abort on check failure; proceed with sync attempt
  }

  return false;
}

/**
 * Process single sync item with idempotency and conflict detection
 */
export async function processSyncItem(item: SyncQueueItem): Promise<boolean> {
  try {
    // Check for conflicts before sending
    if (await checkConflict(item)) {
      incrementRetry(item.id, 'Conflito detectado; sincronização abortada');
      return false;
    }

    // Add idempotency header if body exists
    const idempotencyKey = item.body ? generateIdempotencyKey(item.method, item.url, item.body) : undefined;
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;

    await api.request(item.url, {
      method: item.method,
      body: item.body === undefined ? undefined : JSON.stringify(item.body),
      headers,
    });

    removeSyncItem(item.id);
    console.log(`[Sync] Item ${item.id} synced successfully`);
    return true;
  } catch (error: unknown) {
    const retryCount = item.retryCount + 1;
    const message = getErrorMessage(error);

    if (retryCount >= MAX_RETRIES) {
      incrementRetry(item.id, message);
      console.warn(`[Sync] Item ${item.id} marked as failed after ${MAX_RETRIES} attempts: ${message}`);
      return false;
    }

    incrementRetry(item.id, message);
    console.warn(`[Sync] Retrying item ${item.id} (attempt ${retryCount}/${MAX_RETRIES})`);

    // Exponential backoff before retry
    await new Promise(resolve => window.setTimeout(resolve, getRetryDelay(retryCount)));
    return false;
  }
}

/**
 * Process all items in sync queue sequentially
 * Respects rate limits and offline state
 */
export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) {
    console.log('[Sync] Offline; skipping sync');
    return { synced: 0, failed: 0 };
  }

  const queue = getSyncQueue();
  if (queue.length === 0) {
    console.log('[Sync] Queue empty');
    return { synced: 0, failed: 0 };
  }

  console.log(`[Sync] Processing ${queue.length} items...`);
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    const success = await processSyncItem(item);
    if (success) {
      synced++;
    } else {
      failed++;
    }

    // Small delay between items to avoid rate limiting
    await new Promise(resolve => window.setTimeout(resolve, 100));
  }

  console.log(`[Sync] Complete: ${synced} synced, ${failed} failed`);
  window.dispatchEvent(new CustomEvent('orgapp:sync-complete', { detail: { synced, failed } }));
  return { synced, failed };
}

/** Initialize sync manager with online/offline listeners */
export function initSyncManager(): () => void {
  const handleOnline = async () => {
    console.log('[Sync] Coming online; processing queue...');
    await processSyncQueue();
    window.dispatchEvent(new CustomEvent('orgapp:sync-resumed'));
  };

  const handleOffline = () => {
    console.log('[Sync] Going offline');
    window.dispatchEvent(new CustomEvent('orgapp:sync-paused'));
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Process queue if already online
  if (navigator.onLine) {
    void processSyncQueue();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}


import React, { useEffect, useState } from 'react'
import { CloudOff, RefreshCw, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react'
import { getSyncQueue, processSyncQueue } from '../services/offlineDB'

interface SyncStats {
  pending: number;
  failed: number;
  synced: number;
}

const SyncStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [stats, setStats] = useState<SyncStats>(() => {
    const queue = getSyncQueue()
    return {
      pending: queue.filter(i => !i.failed).length,
      failed: queue.filter(i => i.failed).length,
      synced: 0,
    }
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const refresh = () => {
      setIsOnline(navigator.onLine)
      const queue = getSyncQueue()
      setStats({
        pending: queue.filter(i => !i.failed).length,
        failed: queue.filter(i => i.failed).length,
        synced: 0,
      })
    }

    const onQueueChange = () => {
      const queue = getSyncQueue()
      setStats({
        pending: queue.filter(i => !i.failed).length,
        failed: queue.filter(i => i.failed).length,
        synced: 0,
      })
    }

    const onSyncComplete = (e: Event) => {
      const event = e as CustomEvent<{ synced: number; failed: number }>
      setStats(prev => ({
        ...prev,
        synced: event.detail.synced,
      }))
    }

    window.addEventListener('online', refresh)
    window.addEventListener('offline', refresh)
    window.addEventListener('orgapp:sync-queue-changed', onQueueChange)
    window.addEventListener('orgapp:sync-complete', onSyncComplete)
    refresh()

    return () => {
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', refresh)
      window.removeEventListener('orgapp:sync-queue-changed', onQueueChange)
      window.removeEventListener('orgapp:sync-complete', onSyncComplete)
    }
  }, [])

  const handleRetry = async () => {
    setIsSyncing(true)
    try {
      await processSyncQueue()
    } finally {
      setIsSyncing(false)
    }
  }

  const totalPending = stats.pending + stats.failed
  const hasFailedItems = stats.failed > 0

  if (!isOnline) {
    return (
      <span
        className="sa-sync-status"
        role="status"
        title={`Offline — ${totalPending} alteração${totalPending !== 1 ? 's' : ''} será${totalPending !== 1 ? 'ão' : ''} sincronizada${totalPending !== 1 ? 's' : ''}`}
      >
        <CloudOff className="w-4 h-4" aria-hidden="true" />
        <span className="text-xs">Offline</span>
        {totalPending > 0 && (
          <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 rounded text-xs font-medium">
            {totalPending}
          </span>
        )}
      </span>
    )
  }

  if (totalPending === 0) {
    return (
      <span
        className="sa-sync-status sa-sync-status-success"
        role="status"
        title="Tudo sincronizado"
      >
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
        <span className="text-xs">Sincronizado</span>
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={`sa-sync-status ${hasFailedItems ? 'sa-sync-status-error' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
        disabled={isSyncing}
        title={hasFailedItems ? 'Clique para ver detalhes' : 'Sincronizando...'}
      >
        {hasFailedItems ? (
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
        ) : (
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
        )}
        <span className="text-xs">{totalPending} pendente{totalPending === 1 ? '' : 's'}</span>
        {hasFailedItems && <ChevronDown className="w-3 h-3" />}
      </button>

      {showDetails && totalPending > 0 && (
        <div
          className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-3 w-48 z-40"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {stats.pending > 0 && (
            <div className="mb-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 text-sm mb-1">
                <RefreshCw className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--text)' }}>{stats.pending} pendente{stats.pending === 1 ? '' : 's'}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Será enviado quando conectar
              </p>
            </div>
          )}

          {stats.failed > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-2 text-sm mb-1">
                <AlertCircle className="w-3 h-3" style={{ color: '#ef4444' }} />
                <span style={{ color: 'var(--text)' }}>{stats.failed} com erro</span>
              </div>
              <button
                onClick={handleRetry}
                disabled={isSyncing}
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                }}
              >
                {isSyncing ? 'Tentando...' : 'Tentar novamente'}
              </button>
            </div>
          )}

          {stats.synced > 0 && (
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              ✓ {stats.synced} sincronizado{stats.synced === 1 ? '' : 's'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SyncStatus

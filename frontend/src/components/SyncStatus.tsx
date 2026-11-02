import React, { useEffect, useState } from 'react'
import { CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { getSyncQueue, processSyncQueue } from '../services/offlineDB'

const SyncStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [pendingCount, setPendingCount] = useState(() => getSyncQueue().length)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const refresh = () => {
      setIsOnline(navigator.onLine)
      setPendingCount(getSyncQueue().length)
    }
    const onQueueChange = () => setPendingCount(getSyncQueue().length)

    window.addEventListener('online', refresh)
    window.addEventListener('offline', refresh)
    window.addEventListener('orgapp:sync-queue-changed', onQueueChange)
    refresh()

    return () => {
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', refresh)
      window.removeEventListener('orgapp:sync-queue-changed', onQueueChange)
    }
  }, [])

  const handleRetry = async () => {
    setIsSyncing(true)
    try {
      await processSyncQueue()
    } finally {
      setIsSyncing(false)
      setPendingCount(getSyncQueue().length)
    }
  }

  if (!isOnline) {
    return (
      <span className="sa-sync-status" role="status" title="Você está offline">
        <CloudOff aria-hidden="true" />
        <span>Offline</span>
      </span>
    )
  }

  if (pendingCount === 0) {
    return (
      <span className="sa-sync-status sa-sync-status-success" role="status" title="Tudo sincronizado">
        <CheckCircle2 aria-hidden="true" />
        <span>Sincronizado</span>
      </span>
    )
  }

  const hasFailedItems = getSyncQueue().some(item => item.failed)
  return (
    <button
      type="button"
      className={`sa-sync-status ${hasFailedItems ? 'sa-sync-status-error' : ''}`}
      onClick={() => void handleRetry()}
      disabled={isSyncing}
      title="Tentar sincronizar alterações pendentes"
    >
      {hasFailedItems ? <AlertCircle aria-hidden="true" /> : <RefreshCw aria-hidden="true" className={isSyncing ? 'animate-spin' : ''} />}
      <span>{pendingCount} pendente{pendingCount === 1 ? '' : 's'}</span>
    </button>
  )
}

export default SyncStatus

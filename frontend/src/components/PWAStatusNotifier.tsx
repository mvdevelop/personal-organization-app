import React, { useEffect, useState } from 'react';
import { WifiOff, Package, X } from 'lucide-react';

/**
 * PWA Status Notifier
 * Shows online/offline indicator and SW update notifications
 */
const PWAStatusNotifier: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync queue when coming back online
      window.dispatchEvent(new CustomEvent('orgapp-online'));
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Listen for SW updates
    const handleSWUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ registration: ServiceWorkerRegistration }>;
      setRegistration(customEvent.detail.registration);
      setShowUpdatePrompt(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  const handleUpdateNow = () => {
    if (registration?.waiting) {
      // Tell the service worker to activate immediately
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload page after a short delay to let SW activate
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div
          className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs z-50 flex items-center gap-2 rounded-lg p-3 text-sm"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--danger)',
          }}
          role="status"
          aria-live="polite"
        >
          <WifiOff className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>Você está offline. Os dados estão sendo sincronizados automaticamente.</span>
        </div>
      )}

      {/* SW Update Prompt */}
      {showUpdatePrompt && (
        <div
          className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-xs z-50 rounded-lg p-4 shadow-lg"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
          role="dialog"
          aria-labelledby="update-title"
          aria-describedby="update-desc"
        >
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--gold)' }} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <h3 id="update-title" className="font-semibold text-sm mb-1">
                Atualização disponível
              </h3>
              <p id="update-desc" className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Uma nova versão do Smart Agenda está pronta.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleUpdateNow}
                  className="px-3 py-1.5 rounded text-xs font-medium"
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--bg-base)',
                  }}
                >
                  Atualizar agora
                </button>
                <button
                  onClick={() => setShowUpdatePrompt(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Depois
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="flex-shrink-0 p-1"
              aria-label="Fechar notificação"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAStatusNotifier;

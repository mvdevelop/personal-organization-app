import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

interface PushNotificationManagerProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ onPermissionChange }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    onPermissionChange?.(permission);
  }, [permission, onPermissionChange]);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações.');
      setShowPrompt(false);
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);

      if (result === 'granted') {
        // Test notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: 'Smart Agenda',
            options: {
              body: 'Notificações ativadas com sucesso! 🎉',
              icon: '/icon-192x192.png',
              badge: '/icon.svg',
              tag: 'welcome',
              requireInteraction: false,
            },
          });
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificações:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('push-notification-dismissed', 'true');
  };

  // Show prompt only once per session and if not denied
  if (permission !== 'default' || showPrompt === false) {
    return null;
  }

  const isDismissed = localStorage.getItem('push-notification-dismissed');
  if (isDismissed && !showPrompt) {
    return null;
  }

  return (
    <div
      className="fixed top-20 left-4 right-4 sm:top-20 sm:left-6 sm:right-auto sm:max-w-sm z-40 rounded-lg p-4 shadow-lg"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
      }}
      role="dialog"
      aria-labelledby="notification-title"
      aria-describedby="notification-desc"
    >
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 id="notification-title" className="font-semibold text-sm mb-1">
            Receba notificações
          </h3>
          <p id="notification-desc" className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Fique atualizado com lembretes de tarefas, hábitos e eventos importantes.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded text-xs font-medium"
              style={{
                background: 'var(--accent)',
                color: '#fff',
              }}
            >
              Ativar
            </button>
            <button
              onClick={handleDismiss}
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
          onClick={handleDismiss}
          className="flex-shrink-0 p-1"
          aria-label="Fechar"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PushNotificationManager;

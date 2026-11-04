import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';
import { initOfflineSync } from './services/offlineDB.js';

// Initialize offline sync before SW registration
if (typeof window !== 'undefined') {
  initOfflineSync();
}

// Service Worker — cache offline em produção
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (import.meta.env.PROD) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ SW registered:', reg.scope);

        // Listen for updates to the service worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New SW installed and old one still controlling the page
              // Notify user to reload
              const event = new CustomEvent('sw-update-available', {
                detail: { registration: reg },
              });
              window.dispatchEvent(event);
              console.log('📦 New SW version available');
            }
          });
        });

        // Check for updates every hour
        setInterval(() => {
          reg.update().catch(() => {
            // Silent fail if update check fails
          });
        }, 60 * 60 * 1000);
      } catch (err) {
        console.log('⚠️ SW registration failed:', err);
      }
    } else {
      // Desativa SW antigo em dev para não conflitar com HMR
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
        console.log('🗑️ SW unregistered (dev mode)');
      }
    }
  });
}

// Track online/offline state
window.addEventListener('online', () => {
  window.dispatchEvent(new CustomEvent('app-online-state-changed', { detail: { online: true } }));
});
window.addEventListener('offline', () => {
  window.dispatchEvent(new CustomEvent('app-online-state-changed', { detail: { online: false } }));
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </AuthProvider>
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

// Service Worker — cache offline em produção
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (import.meta.env.PROD) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ SW registered:', reg.scope);
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </AuthProvider>
  </React.StrictMode>
);

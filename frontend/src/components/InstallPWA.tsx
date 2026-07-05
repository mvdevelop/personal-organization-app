import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const dismissed = localStorage.getItem('@orgapp:pwa-dismissed')
    if (dismissed === 'true') return

    // Capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Fallback: show banner after 15s even without the event
    const fallbackTimer = setTimeout(() => {
      setShowBanner(true)
    }, 15_000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setShowBanner(false)
      setDeferredPrompt(null)
    } else {
      // Fallback: show instructions
      alert('Para instalar o Schedule:\n\n1. Abra o menu do navegador (⋮)\n2. Selecione "Adicionar à tela inicial"\n3. Confirme a instalação')
      setShowBanner(false)
    }
  }, [deferredPrompt])

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('@orgapp:pwa-dismissed', 'true')
  }

  if (isInstalled || !showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 relative overflow-hidden">
        <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            {deferredPrompt ? (
              <Download className="w-6 h-6 text-white" />
            ) : (
              <Smartphone className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Instalar Schedule
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Acesse rapidamente e organize sua vida de qualquer lugar!
            </p>
            <div className="flex gap-2">
              <button onClick={handleInstall}
                className="px-4 py-1.5 text-xs font-medium text-white rounded-lg btn-primary">
                {deferredPrompt ? 'Instalar' : 'Como instalar'}
              </button>
              <button onClick={handleDismiss}
                className="px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstallPWA

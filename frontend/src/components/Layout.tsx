import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingAIButton from './FloatingAIButton';
import NativeBottomNav from './NativeBottomNav';
import InstallPWA from './InstallPWA';
import ThemeCustomizer from './ThemeCustomizer';
import { useAppSelector } from '../hooks/redux';
import toast from 'react-hot-toast';

const Layout: React.FC = () => {
  const { sidebarCollapsed } = useAppSelector(state => state.userPreferences)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  // Mobile: the collapse control doubles as "close drawer".
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSidebarOpen(false)
        setThemeCustomizerOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handlePlans = () => {
    toast('O plano Smart Plus chega em breve. Continue organizando no plano gratuito.', {
      icon: '✨',
    })
  }

  return (
    <div className="sa-shell" data-collapsed={sidebarCollapsed ? 'true' : 'false'}>
      {mobileSidebarOpen && (
        <button
          type="button"
          className="sa-scrim lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onNavigate={() => setMobileSidebarOpen(false)}
        onOpenPlans={handlePlans}
      />

      <div className="sa-main">
        <Header
          onMenuToggle={() => setMobileSidebarOpen(prev => !prev)}
          onThemeSettings={() => setThemeCustomizerOpen(true)}
        />
        <main className="sa-page">
          <Outlet />
        </main>
      </div>

      <FloatingAIButton />
      <InstallPWA />
      <NativeBottomNav />

      {themeCustomizerOpen && (
        <ThemeCustomizer onClose={() => setThemeCustomizerOpen(false)} />
      )}
    </div>
  )
}

export default Layout

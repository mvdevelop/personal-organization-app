import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingAIButton from './FloatingAIButton';
import { useAppSelector } from '../hooks/redux';

const Layout: React.FC = () => {
  const { sidebarCollapsed } = useAppSelector(state => state.userPreferences)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  const handleMenuToggle = () => {
    setMobileSidebarOpen(prev => !prev)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar: always visible on lg+, drawer on mobile */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuToggle={handleMenuToggle} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <Outlet />
        </main>
      </div>
      <FloatingAIButton />
    </div>
  )
}

export default Layout

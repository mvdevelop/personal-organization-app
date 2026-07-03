
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppSelector } from '../hooks/redux';

const Layout: React.FC = () => {
  const { sidebarCollapsed } = useAppSelector(state => state.userPreferences)

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout;

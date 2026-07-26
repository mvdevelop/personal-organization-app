import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import {
  Menu, Sun, Moon, LogOut, User, Palette,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { toggleTheme } from '../store/slices/userPreferencesSlice';

interface HeaderProps {
  onMenuToggle: () => void
  onThemeSettings?: () => void
}

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tarefas',
  '/notes': 'Notas',
  '/habits': 'Hábitos',
  '/goals': 'Metas',
  '/studies': 'Estudos',
  '/ai': 'Assistente IA',
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onThemeSettings }) => {
  const { isSignedIn, user, signOut } = useAuth()
  const dispatch = useAppDispatch()
  const { theme, sidebarCollapsed } = useAppSelector(state => state.userPreferences)
  const location = useLocation()

  if (!isSignedIn) return null

  const currentLabel = ROUTE_LABELS[location.pathname] || ''

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5">
        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuToggle}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            title="Menu"
          >
            <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-body text-sm text-gray-400 dark:text-gray-500 font-medium">
              Schedule
            </span>
            {currentLabel && (
              <>
                <span className="font-serif-alt text-xs text-primary">◆</span>
                <span className="font-body text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {currentLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Theme customizer */}
          <button
            onClick={onThemeSettings}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Personalizar tema"
          >
            <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Alternar modo"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <Sun className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {/* User info */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="medal-ring !w-6 !h-6 !border-gray-300 dark:!border-gray-600 bg-white dark:bg-gray-600">
                <span className="font-ui text-[10px] font-bold text-gray-500 dark:text-gray-300">
                  {getInitials(user.name)}
                </span>
              </div>
              <span className="font-body text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={signOut}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 dark:text-gray-500"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  Menu, Sun, Moon, LogOut, User, Palette,
  Home, CheckSquare, FileText,
  Lightbulb, Target, BookOpen, Bot,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { toggleTheme } from '../store/slices/userPreferencesSlice';

type LucideIcon = React.FC<{ className?: string; style?: React.CSSProperties }>

const ROUTE_META: Record<string, { icon: LucideIcon; label: string }> = {
  '/': { icon: Home, label: 'Dashboard' },
  '/tasks': { icon: CheckSquare, label: 'Tarefas' },
  '/notes': { icon: FileText, label: 'Notas' },
  '/habits': { icon: Lightbulb, label: 'Hábitos' },
  '/goals': { icon: Target, label: 'Metas' },
  '/studies': { icon: BookOpen, label: 'Estudos' },
  '/ai': { icon: Bot, label: 'Assistente IA' },
}

interface HeaderProps {
  onMenuToggle: () => void
  onThemeSettings?: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onThemeSettings }) => {
  const { isSignedIn, user, signOut } = useAuth()
  const dispatch = useAppDispatch()
  const { theme, sidebarCollapsed } = useAppSelector(state => state.userPreferences)
  const location = useLocation()

  if (!isSignedIn) return null

  // Find current route meta
  const currentRoute = ROUTE_META[location.pathname]
  const PageIcon = currentRoute?.icon || Home

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm relative">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger — always visible on small screens */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            title="Menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Page icon + title — on mobile always, on desktop when sidebar is collapsed */}
          {currentRoute && (
            <div className="flex items-center gap-3 lg:hidden">
              <PageIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentRoute.label}
              </h2>
            </div>
          )}
          {sidebarCollapsed && currentRoute && (
            <div className="hidden lg:flex items-center gap-3">
              <PageIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentRoute.label}
              </h2>
            </div>
          )}
        </div>

        {/* Options — aligned to the right */}
        <div className="flex items-center gap-1 sm:gap-3 ml-auto">
          <button
            onClick={onThemeSettings}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Personalizar tema"
          >
            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Alternar modo"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{user?.name}</span>
          </div>

          <button
            onClick={signOut}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

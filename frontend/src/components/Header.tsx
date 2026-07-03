import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Sun, Moon, LogOut, User, Palette } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { toggleTheme } from '../store/slices/userPreferencesSlice';

interface HeaderProps {
  onMenuToggle: () => void
  onThemeSettings?: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onThemeSettings }) => {
  const { isSignedIn, user, signOut } = useAuth()
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector(state => state.userPreferences)

  if (!isSignedIn) return null

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          title="Menu"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="lg:hidden" />

        <div className="flex items-center gap-2 sm:gap-4">
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

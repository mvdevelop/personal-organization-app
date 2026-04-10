
import React from 'react';
import { UserButton, useAuth } from '@clerk/clerk-react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { toggleSidebar, toggleTheme } from '../store/slices/userPreferencesSlice';

const Header: React.FC = () => {
  const { isSignedIn } = useAuth()
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector(state => state.userPreferences)

  if (!isSignedIn) return null

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}

export default Header;

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, CheckSquare, FileText,
  Lightbulb, Target, BookOpen, Bot,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAppDispatch } from '../hooks/redux';
import { toggleSidebar } from '../store/slices/userPreferencesSlice';

interface SidebarProps {
  collapsed: boolean
}

const ALL_NAV = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { path: '/notes', icon: FileText, label: 'Notas' },
  { path: '/habits', icon: Lightbulb, label: 'Hábitos' },
  { path: '/goals', icon: Target, label: 'Metas' },
  { path: '/studies', icon: BookOpen, label: 'Estudos' },
  { path: '/ai', icon: Bot, label: 'Assistente IA' },
]

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const currentPage = ALL_NAV.find(n => location.pathname === n.path)
  const PageIcon = currentPage?.icon || Home

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
      isActive
        ? 'bg-primary-light text-primary font-medium'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    } ${collapsed ? 'justify-center px-0' : ''}`

  const iconClass = "w-5 h-5 flex-shrink-0"

  return (
    <aside className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col w-full">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
        {collapsed ? (
          <h1 className="text-xl font-bold text-primary text-center">
            <PageIcon className="w-6 h-6 mx-auto" />
          </h1>
        ) : (
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-primary" style={{ color: 'var(--color-primary)' }}>◆</span> Schedule
          </h1>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
        {ALL_NAV.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass} end={item.path === '/'}>
            <item.icon className={iconClass} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 dark:border-gray-700/50 py-2 px-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

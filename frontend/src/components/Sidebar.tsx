import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Gauge, ClipboardList, StickyNote,
  Zap, Trophy, GraduationCap, Brain,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch } from '../hooks/redux';
import { toggleSidebar } from '../store/slices/userPreferencesSlice';
import LogoIcon from './LogoIcon';

interface SidebarProps {
  collapsed: boolean
}

const ALL_NAV = [
  { path: '/', icon: Gauge, label: 'Dashboard' },
  { path: '/tasks', icon: ClipboardList, label: 'Tarefas' },
  { path: '/notes', icon: StickyNote, label: 'Notas' },
  { path: '/habits', icon: Zap, label: 'Hábitos' },
  { path: '/goals', icon: Trophy, label: 'Metas' },
  { path: '/studies', icon: GraduationCap, label: 'Estudos' },
  { path: '/ai', icon: Brain, label: 'Assistente IA' },
]

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 transition-all duration-150 text-sm ${
      isActive
        ? 'text-primary font-semibold'
        : 'text-gray-500 dark:text-gray-400 hover:text-primary'
    } ${collapsed ? 'justify-center px-0' : ''}`

  const iconClass = "w-5 h-5 flex-shrink-0"

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <aside className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col w-full shadow-warm-md">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
        {collapsed ? (
          <h1 className="text-xl font-bold text-center text-primary" title="Schedule">
            <LogoIcon className="mx-auto" size={28} />
          </h1>
        ) : (
          <h1 className="font-display text-xl font-bold flex items-center gap-2 px-1 text-primary tracking-wide">
            <LogoIcon size={28} />
            <span>Schedule</span>
          </h1>
        )}
      </div>

      {/* User Avatar */}
      {!collapsed && user && (
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <div className="medal-ring !w-9 !h-9 !border-primary bg-primary-light">
            <span className="font-ui text-xs font-bold text-primary">{getInitials(user.name)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-ui text-sm font-medium truncate text-gray-900 dark:text-white">
              {user.name}
            </p>
            <p className="font-body text-xs truncate text-gray-400 dark:text-gray-500">
              {user.email}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-3">
        {ALL_NAV.map((item, idx) => (
          <React.Fragment key={item.path}>
            {idx === 6 && !collapsed && (
              <div className="divider-diamond my-3 px-1" />
            )}
            <NavLink
              to={item.path}
              className={linkClass}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={iconClass} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </React.Fragment>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-gray-100 dark:border-gray-700/50 py-2 px-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center gap-3 w-full px-4 py-2.5 transition-colors duration-150 text-sm text-gray-500 dark:text-gray-400 hover:text-primary cursor-pointer"
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

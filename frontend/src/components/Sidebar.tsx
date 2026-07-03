import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, CheckSquare, FileText, Calendar,
  Dumbbell, Target, BookOpen, Bot,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const mainNav = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tarefas' },
    { path: '/notes', icon: FileText, label: 'Notas' },
  ]

  const lifeNav = [
    { path: '/habits', icon: Dumbbell, label: 'Hábitos' },
    { path: '/goals', icon: Target, label: 'Metas' },
    { path: '/studies', icon: BookOpen, label: 'Estudos' },
  ]

  const toolsNav = [
    { path: '/ai', icon: Bot, label: 'Assistente IA' },
  ]

  const bottomNav = [
    { path: '/calendar', icon: Calendar, label: 'Calendário' },
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
      isActive
        ? 'bg-primary-light text-primary font-medium'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    } ${collapsed ? 'justify-center px-0' : ''}`

  const iconClass = "w-5 h-5 flex-shrink-0"
  const sectionLabel = collapsed ? 'sr-only' : 'text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4'

  return (
    <aside className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col w-full">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
        {collapsed ? (
          <h1 className="text-xl font-bold text-primary text-center">O</h1>
        ) : (
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-primary" style={{ color: 'var(--color-primary)' }}>◆</span> OrgApp
          </h1>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
        {mainNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass} end={item.path === '/'}>
            <item.icon className={iconClass} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && <div className={sectionLabel}>Vida</div>}
        {lifeNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <item.icon className={iconClass} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && <div className={sectionLabel + ' mt-4'}>Ferramentas</div>}
        {toolsNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <item.icon className={iconClass} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 dark:border-gray-700/50 py-2 px-3">
        {bottomNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <item.icon className={iconClass} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar

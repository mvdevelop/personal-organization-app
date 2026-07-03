import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckSquare, FileText, Calendar, Home, X } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tarefas' },
    { path: '/notes', icon: FileText, label: 'Notas' },
    { path: '/calendar', icon: Calendar, label: 'Calendário' },
  ]

  return (
    <aside className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            OrgApp
          </h1>
        )}
        {/* X close button appears only on mobile via the Layout overlay */}
        {collapsed && (
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mx-auto">
            O
          </h1>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar

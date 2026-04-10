
import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckSquare, FileText, Calendar, Home } from 'lucide-react';

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
    <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="p-4">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-8">
            OrgApp
          </h1>
        )}
        <nav className="space-y-2">
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
              <item.icon className="w-5 h-5" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar;

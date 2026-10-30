import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ListChecks, NotebookPen, Flame,
  Flag, GraduationCap, Sparkles, Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tarefas', icon: ListChecks },
  { path: '/habits', label: 'Hábitos', icon: Flame },
  { path: '/notes', label: 'Notas', icon: NotebookPen },
  { path: '/goals', label: 'Metas', icon: Flag },
  { path: '/studies', label: 'Estudos', icon: GraduationCap },
  { path: '/ai', label: 'IA', icon: Sparkles },
  { path: '/settings', label: 'Ajustes', icon: Settings },
]

const NativeBottomNav: React.FC = () => {
  const location = useLocation()

  // Only show on protected routes (not on sign-in page)
  if (location.pathname === '/sign-in') return null

  return (
    <nav className="native-bottom-nav" aria-label="Navegação principal">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `native-nav-item ${isActive ? 'active' : ''}`
          }
          title={label}
        >
          <Icon className="native-nav-icon" />
          <span className="native-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default NativeBottomNav

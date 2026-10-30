import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ListChecks, NotebookPen, Flame,
  Flag, GraduationCap, Sparkles,
  PanelLeftClose, PanelLeftOpen, Settings,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch } from '../hooks/redux';
import { toggleSidebar } from '../store/slices/userPreferencesSlice';
import AppMark from './AppMark';

interface SidebarProps {
  collapsed: boolean
  mobileOpen?: boolean
  onNavigate?: () => void
  onOpenPlans?: () => void
}

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: ListChecks, label: 'Tarefas' },
  { path: '/notes', icon: NotebookPen, label: 'Notas' },
  { path: '/habits', icon: Flame, label: 'Hábitos' },
  { path: '/goals', icon: Flag, label: 'Metas' },
  { path: '/studies', icon: GraduationCap, label: 'Estudos' },
  { path: '/ai', icon: Sparkles, label: 'Assistente IA' },
  { path: '/settings', icon: Settings, label: 'Configurações' },
]

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen, onNavigate, onOpenPlans }) => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const initial = (user?.name?.trim()?.[0] ?? 'V').toUpperCase()

  return (
    <aside
      className={`sa-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}
      aria-label="Navegação principal"
    >
      <div className="sa-sidebar-inner">
        <NavLink to="/" className="sa-brand" onClick={onNavigate} aria-label="Smart Agenda — início">
          <span className="sa-logo" aria-hidden="true">
            <AppMark size={32} />
          </span>
          <span className="sa-brand-text">
            <span className="sa-brand-name">Smart Agenda</span>
            <span className="sa-brand-tag">YOUR DAY, IN SYNC</span>
          </span>
        </NavLink>

        <div className="sa-profile" title={user?.email}>
          <span className="sa-avatar" aria-hidden="true">{initial}</span>
          <span className="sa-profile-text">
            <span className="sa-profile-name">{user?.name ?? 'Visitante'}</span>
            <span className="sa-profile-mail">{user?.email ?? 'sem sessão'}</span>
          </span>
        </div>

        <nav className="sa-nav" aria-label="Seções">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span className="sa-nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sa-sidebar-foot">
          <div className="sa-promo">
            <span className="sa-promo-icon" aria-hidden="true">
              <Sparkles style={{ width: 15, height: 15 }} />
            </span>
            <span className="sa-promo-title">Um novo nível de foco</span>
            <span className="sa-promo-text">
              Desbloqueie todo o potencial da sua rotina com o Smart Plus.
            </span>
            <button type="button" className="sa-promo-btn" onClick={onOpenPlans}>
              Conhecer planos
            </button>
          </div>

          <button
            type="button"
            className="sa-collapse"
            onClick={() => dispatch(toggleSidebar())}
            aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {collapsed ? <PanelLeftOpen size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
            <span className="sa-collapse-label">Recolher menu</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

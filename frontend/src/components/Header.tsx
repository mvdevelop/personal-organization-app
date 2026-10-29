import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Menu, Sun, Moon, LogOut, Search, Bell, ChevronRight, Palette,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { toggleTheme } from '../store/slices/userPreferencesSlice';
import AppMark from './AppMark';

interface HeaderProps {
  onMenuToggle: () => void
  onThemeSettings?: () => void
}

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tarefas',
  '/notes': 'Notas',
  '/habits': 'Hábitos',
  '/goals': 'Metas',
  '/studies': 'Estudos',
  '/ai': 'Assistente IA',
  '/calendar': 'Calendário',
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onThemeSettings }) => {
  const { isSignedIn, user, signOut } = useAuth()
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector(state => state.userPreferences)
  const location = useLocation()
  const [notificationsRead, setNotificationsRead] = useState(false)

  if (!isSignedIn) return null

  const currentLabel = ROUTE_LABELS[location.pathname] ?? ''
  const initial = (user?.name?.trim()?.[0] ?? 'V').toUpperCase()

  const handleSearch = () => {
    toast('Pesquisa global chega com a próxima atualização. Use a busca dentro de cada seção.', {
      icon: '🔎',
    })
  }

  const handleNotifications = () => {
    setNotificationsRead(true)
    toast.success('Tudo em ordem por aqui — nenhuma novidade pendente.')
  }

  return (
    <header className="sa-topbar">
      <button
        type="button"
        onClick={onMenuToggle}
        className="sa-icon-btn sa-menu-btn"
        aria-label="Abrir menu de navegação"
      >
        <Menu />
      </button>

      <nav className="sa-crumbs" aria-label="Você está em">
        <span className="sa-topbar-brand">
          <AppMark size={22} />
          Smart Agenda
        </span>
        <ChevronRight aria-hidden="true" />
        <strong>{currentLabel || 'Dashboard'}</strong>
      </nav>

      <div className="sa-topbar-spacer" />

      <button type="button" className="sa-icon-btn" onClick={handleSearch} aria-label="Pesquisar" title="Pesquisar">
        <Search />
      </button>

      <button type="button" className="sa-icon-btn" onClick={handleNotifications} aria-label="Notificações" title="Notificações">
        <Bell />
        {!notificationsRead && <span className="sa-notif-dot" aria-hidden="true" />}
      </button>

      {onThemeSettings && (
        <button type="button" className="sa-icon-btn" onClick={onThemeSettings} aria-label="Ajustes de aparência" title="Aparência">
          <Palette />
        </button>
      )}

      <button
        type="button"
        className="sa-icon-btn"
        onClick={() => dispatch(toggleTheme())}
        aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
      </button>

      <span className="sa-plan">Plano gratuito</span>

      <button
        type="button"
        className="sa-user"
        onClick={() => toast(`${user?.name ?? 'Você'} · ${user?.email ?? ''} · Plano gratuito`, { icon: '👤' })}
        aria-label={`Conta de ${user?.name ?? 'usuário'}`}
        title={user?.email}
      >
        <span className="sa-avatar" aria-hidden="true">{initial}</span>
        <span className="sa-user-name">{user?.name?.split(' ')[0] ?? 'Você'}</span>
      </button>

      <button
        type="button"
        className="sa-icon-btn"
        onClick={signOut}
        aria-label="Sair da conta"
        title="Sair"
      >
        <LogOut />
      </button>
    </header>
  )
}

export default Header

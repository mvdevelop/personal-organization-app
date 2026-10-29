import type { Middleware } from '@reduxjs/toolkit';
import {
  toggleTheme, setTheme, toggleSidebar, setSidebarCollapsed,
} from './slices/userPreferencesSlice';
import type { UserPreferences } from './slices/userPreferencesSlice';

const STORAGE_KEY = 'userPreferences'

/** Apply a theme mode (light/dark) to the DOM */
function applyThemeMode(mode: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', mode === 'dark' ? '#111318' : '#f6f7fb')
}

/** Save preferences to localStorage */
function savePreferences(state: UserPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
    }))
  } catch {
    // ignore storage errors
  }
}

/** Dispatch-type → side-effect map */
const EFFECTS: Record<string, (state: UserPreferences) => void> = {
  [toggleTheme.type]: (s) => { applyThemeMode(s.theme) },
  [setTheme.type]: (s) => { applyThemeMode(s.theme) },
  [toggleSidebar.type]: () => {},
  [setSidebarCollapsed.type]: () => {},
}

const EFFECT_TYPES = new Set(Object.keys(EFFECTS))

/**
 * Middleware that persists user preferences and applies DOM changes
 * — keeping the reducers pure.
 */
export const preferencesMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action)

  if (typeof action === 'object' && action !== null && 'type' in action) {
    const type = (action as { type: string }).type

    if (EFFECT_TYPES.has(type)) {
      const state = storeApi.getState().userPreferences as UserPreferences
      EFFECTS[type](state)
      savePreferences(state)
    }
  }

  return result
}

/**
 * Initialize preferences on app load.
 * Call once from store/index.ts after the store is created.
 */
export function initPreferences(store: { getState: () => { userPreferences: UserPreferences } }) {
  applyThemeMode(store.getState().userPreferences.theme)
}

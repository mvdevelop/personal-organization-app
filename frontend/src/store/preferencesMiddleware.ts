import type { Middleware } from '@reduxjs/toolkit';
import { COLOR_THEMES, FONT_OPTIONS } from '../theme/themes';
import {
  toggleTheme, setTheme, setColorTheme, setFont,
} from './slices/userPreferencesSlice';
import type { UserPreferences } from './slices/userPreferencesSlice';

/** Apply a theme mode (light/dark) to the DOM */
function applyThemeMode(mode: 'light' | 'dark') {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

/** Save preferences to localStorage */
function savePreferences(state: UserPreferences) {
  try {
    localStorage.setItem('userPreferences', JSON.stringify({
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      colorTheme: state.colorTheme,
      font: state.font,
    }))
  } catch {
    // ignore storage errors
  }
}

/** Load a Google Font if specified */
function loadGoogleFont(googleFont?: string) {
  if (!googleFont) return
  const id = 'google-font-load'
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${googleFont}&display=swap`
  document.head.appendChild(link)
}

/** Apply font family to the document */
function applyFont(fontName: string) {
  const fontOption = FONT_OPTIONS.find(f => f.name === fontName)
  if (fontOption) {
    document.documentElement.style.fontFamily = fontOption.fontFamily
    loadGoogleFont(fontOption.googleFont)
  }
}

/** Apply color theme CSS variables to :root based on the TypeScript theme config */
function applyColorTheme(themeName: string) {
  const theme = COLOR_THEMES.find(t => t.name === themeName) || COLOR_THEMES[0]
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--color-${key}`, value)
  }
}

/** Dispatch-type → side-effect map */
const EFFECTS: Record<string, (state: UserPreferences) => void> = {
  [toggleTheme.type]: (s) => { applyThemeMode(s.theme) },
  [setTheme.type]: (s) => { applyThemeMode(s.theme) },
  [setColorTheme.type]: (s) => { applyColorTheme(s.colorTheme) },
  [setFont.type]: (s) => { applyFont(s.font) },
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
 * Call once from main.tsx after the store is created.
 */
export function initPreferences(store: { getState: () => { userPreferences: UserPreferences } }) {
  const prefs = store.getState().userPreferences
  applyThemeMode(prefs.theme)
  applyColorTheme(prefs.colorTheme)
  applyFont(prefs.font)
}

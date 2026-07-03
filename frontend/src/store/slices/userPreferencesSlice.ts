import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { COLOR_THEMES, FONT_OPTIONS } from '../../theme/themes';

interface UserPreferences {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  colorTheme: string
  font: string
}

function loadPreferences(): UserPreferences {
  try {
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // ignore parse errors
  }
  return {
    theme: 'light',
    sidebarCollapsed: false,
    colorTheme: 'default',
    font: 'system',
  }
}

const initialState: UserPreferences = loadPreferences()

// Apply saved preferences on load
const font = FONT_OPTIONS.find(f => f.name === initialState.font)
if (font) {
  loadGoogleFont(font.googleFont)
  document.documentElement.style.fontFamily = font.fontFamily
}
document.documentElement.setAttribute('data-theme', initialState.colorTheme)

function loadGoogleFont(googleFont?: string): void {
  if (!googleFont) return
  const id = 'google-font-load'
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${googleFont}&display=swap`
  document.head.appendChild(link)
}

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      applyThemeMode(state.theme)
      savePreferences(state)
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
      savePreferences(state)
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      applyThemeMode(state.theme)
      savePreferences(state)
    },
    setColorTheme: (state, action: PayloadAction<string>) => {
      state.colorTheme = action.payload
      document.documentElement.setAttribute('data-theme', action.payload)
      savePreferences(state)
    },
    setFont: (state, action: PayloadAction<string>) => {
      state.font = action.payload
      const fontOption = FONT_OPTIONS.find(f => f.name === action.payload)
      if (fontOption) {
        document.documentElement.style.fontFamily = fontOption.fontFamily
        loadGoogleFont(fontOption.googleFont)
      }
      savePreferences(state)
    },
  },
})

function applyThemeMode(mode: 'light' | 'dark'): void {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function savePreferences(state: UserPreferences): void {
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

export const { toggleTheme, toggleSidebar, setTheme, setColorTheme, setFont } = userPreferencesSlice.actions
export default userPreferencesSlice.reducer

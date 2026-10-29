import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark'

export interface UserPreferences {
  theme: ThemeMode
  sidebarCollapsed: boolean
}

const STORAGE_KEY = 'userPreferences'

function loadPreferences(): UserPreferences {
  const defaults: UserPreferences = {
    theme: 'dark',
    sidebarCollapsed: false,
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaults
    const parsed = JSON.parse(saved) as Partial<UserPreferences>
    return {
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      sidebarCollapsed: Boolean(parsed.sidebarCollapsed),
    }
  } catch {
    return defaults
  }
}

const initialState: UserPreferences = loadPreferences()

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
  },
})

export const { toggleTheme, setTheme, toggleSidebar, setSidebarCollapsed } = userPreferencesSlice.actions
export default userPreferencesSlice.reducer

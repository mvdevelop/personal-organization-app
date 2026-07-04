import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserPreferences {
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

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    setColorTheme: (state, action: PayloadAction<string>) => {
      state.colorTheme = action.payload
    },
    setFont: (state, action: PayloadAction<string>) => {
      state.font = action.payload
    },
  },
})

export const { toggleTheme, toggleSidebar, setTheme, setColorTheme, setFont } = userPreferencesSlice.actions
export default userPreferencesSlice.reducer

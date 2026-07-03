import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserPreferences {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
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
  return { theme: 'light', sidebarCollapsed: false }
}

const initialState: UserPreferences = loadPreferences()

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      savePreferences(state)
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
      savePreferences(state)
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      savePreferences(state)
    },
  },
})

function savePreferences(state: UserPreferences): void {
  try {
    localStorage.setItem('userPreferences', JSON.stringify({
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
    }))
  } catch {
    // ignore storage errors
  }
}

export const { toggleTheme, toggleSidebar, setTheme } = userPreferencesSlice.actions
export default userPreferencesSlice.reducer

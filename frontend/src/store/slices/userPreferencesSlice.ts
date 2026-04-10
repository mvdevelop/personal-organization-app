
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserPreferences {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
}

const initialState: UserPreferences = {
  theme: 'light',
  sidebarCollapsed: false,
}

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
  },
})

export const { toggleTheme, toggleSidebar, setTheme } = userPreferencesSlice.actions
export default userPreferencesSlice.reducer

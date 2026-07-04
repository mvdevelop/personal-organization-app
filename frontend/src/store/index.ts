
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import notesReducer from './slices/notesSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';
import domainsReducer from './slices/domainsSlice';
import habitsReducer from './slices/habitsSlice';
import goalsReducer from './slices/goalsSlice';
import studiesReducer from './slices/studiesSlice';
import aiReducer from './slices/aiSlice';
import dashboardReducer from './slices/dashboardSlice';
import gamificationReducer from './slices/gamificationSlice';
import { preferencesMiddleware, initPreferences } from './preferencesMiddleware';

export const store = configureStore({
  devTools: import.meta.env.DEV,

  reducer: {
    tasks: tasksReducer,
    notes: notesReducer,
    userPreferences: userPreferencesReducer,
    domains: domainsReducer,
    habits: habitsReducer,
    goals: goalsReducer,
    studies: studiesReducer,
    ai: aiReducer,
    dashboard: dashboardReducer,
    gamification: gamificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(preferencesMiddleware),
})

// Initialize DOM-side effects (theme, font) from persisted preferences.
initPreferences(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

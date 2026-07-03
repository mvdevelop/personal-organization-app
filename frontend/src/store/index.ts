
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import notesReducer from './slices/notesSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';
import domainsReducer from './slices/domainsSlice';
import habitsReducer from './slices/habitsSlice';
import goalsReducer from './slices/goalsSlice';
import studiesReducer from './slices/studiesSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    notes: notesReducer,
    userPreferences: userPreferencesReducer,
    domains: domainsReducer,
    habits: habitsReducer,
    goals: goalsReducer,
    studies: studiesReducer,
    ai: aiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

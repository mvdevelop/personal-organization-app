
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import notesReducer from './slices/notesSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    notes: notesReducer,
    userPreferences: userPreferencesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

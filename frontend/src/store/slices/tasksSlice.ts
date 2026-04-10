
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate: string | null
  createdAt: string
  userId: string
}

interface TasksState {
  tasks: Task[]
  filter: 'all' | 'active' | 'completed'
  searchQuery: string
}

const initialState: TasksState = {
  tasks: [],
  filter: 'all',
  searchQuery: '',
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload)
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload)
    },
    toggleTask: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(task => task.id === action.payload)
      if (task) {
        task.completed = !task.completed
      }
    },
    setFilter: (state, action: PayloadAction<TasksState['filter']>) => {
      state.filter = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
})

export const { addTask, updateTask, deleteTask, toggleTask, setFilter, setSearchQuery } = tasksSlice.actions
export default tasksSlice.reducer

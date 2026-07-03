import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
}

interface TasksState {
  tasks: Task[]
  filter: 'all' | 'active' | 'completed'
  searchQuery: string
  loading: boolean
  error: string | null
}

const initialState: TasksState = {
  tasks: [],
  filter: 'all',
  searchQuery: '',
  loading: false,
  error: null,
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: { filter?: string; search?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.filter && params.filter !== 'all') query.set('filter', params.filter)
    if (params.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<Task[]>(`/api/tasks${qs ? `?${qs}` : ''}`)
  },
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: CreateTaskInput) => {
    return api.post<Task>('/api/tasks', data)
  },
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
    return api.put<Task>(`/api/tasks/${id}`, data)
  },
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string) => {
    await api.delete(`/api/tasks/${id}`)
    return id
  },
)

export const toggleTask = createAsyncThunk(
  'tasks/toggleTask',
  async (id: string) => {
    return api.patch<Task>(`/api/tasks/${id}/toggle`)
  },
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<TasksState['filter']>) => {
      state.filter = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.loading = false
      state.tasks = action.payload
    })
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Erro ao carregar tarefas'
    })

    // Create
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.unshift(action.payload)
    })
    builder.addCase(createTask.rejected, (state, action) => {
      state.error = action.error.message || 'Erro ao criar tarefa'
    })

    // Update
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    })
    builder.addCase(updateTask.rejected, (state, action) => {
      state.error = action.error.message || 'Erro ao atualizar tarefa'
    })

    // Delete
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload)
    })
    builder.addCase(deleteTask.rejected, (state, action) => {
      state.error = action.error.message || 'Erro ao deletar tarefa'
    })

    // Toggle
    builder.addCase(toggleTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    })
    builder.addCase(toggleTask.rejected, (state, action) => {
      state.error = action.error.message || 'Erro ao alternar tarefa'
    })
  },
})

export const { setFilter, setSearchQuery, clearError } = tasksSlice.actions
export default tasksSlice.reducer

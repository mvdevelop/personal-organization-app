import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import tasksReducer, {
  fetchTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  setFilter,
  setSearchQuery,
  clearError,
  type Task,
  type CreateTaskInput,
} from '../../store/slices/tasksSlice';
import type { TasksState } from '../../store/slices/tasksSlice';
import { api } from '../../services/api';

// Mock do API client
vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

// Configurar o store de teste
const createTestStore = () => {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializeCheck: false, thunk: true }),
  });
};

// Mock de dados
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Tarefa 1',
    description: 'Descrição 1',
    completed: false,
    priority: 'medium',
    dueDate: null,
    userId: '1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Tarefa 2',
    description: 'Descrição 2',
    completed: true,
    priority: 'high',
    dueDate: '2024-12-31',
    userId: '1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

type AppStore = EnhancedStore<{ tasks: TasksState }>;

describe('Tasks Slice', () => {
  let store: AppStore;

  beforeEach(() => {
    store = createTestStore();
    vi.clearAllMocks();
  });

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce(mockTasks);

      await store.dispatch(fetchTasks());

      const state = store.getState().tasks;
      expect(state.tasks).toHaveLength(2);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await store.dispatch(fetchTasks());

      const state = store.getState().tasks;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('should pass filter and search params to API', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce([]);

      await store.dispatch(fetchTasks({ filter: 'active', search: 'test' }));

      expect(api.get).toHaveBeenCalledWith('/api/tasks?filter=active&search=test');
    });
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const newTaskData: CreateTaskInput = { title: 'Nova Tarefa', description: 'Nova descrição' };
      const newTask: Task = {
        id: '3',
        title: newTaskData.title,
        description: newTaskData.description || '',
        completed: false,
        priority: 'medium',
        dueDate: null,
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (api.post as jest.Mock).mockResolvedValueOnce(newTask);

      await store.dispatch(createTask(newTaskData));

      const state = store.getState().tasks;
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].title).toBe('Nova Tarefa');
    });

    it('should handle create error', async () => {
      (api.post as jest.Mock).mockRejectedValueOnce(new Error('Validation error'));

      await store.dispatch(createTask({ title: '' }));

      const state = store.getState().tasks;
      expect(state.error).toBe('Validation error');
    });
  });

  describe('toggleTask', () => {
    it('should toggle task completion', async () => {
      // Primeiro, popula o store com tasks
      store = createTestStore();
      store.dispatch({ type: 'tasks/fetchTasks/fulfilled', payload: mockTasks });

      const toggledTask: Task = { ...mockTasks[0], completed: true };
      (api.patch as jest.Mock).mockResolvedValueOnce(toggledTask);

      await store.dispatch(toggleTask('1'));

      const state = store.getState().tasks;
      expect(state.tasks).toHaveLength(2);
      expect(state.tasks[0].completed).toBe(true);
    });
  });

  describe('deleteTask', () => {
    it('should delete task', async () => {
      (api.delete as jest.Mock).mockResolvedValueOnce(undefined);

      // Adicionar tasks primeiro
      store = createTestStore();
      store.dispatch({ type: 'tasks/fetchTasks/fulfilled', payload: mockTasks });

      await store.dispatch(deleteTask('1'));

      const state = store.getState().tasks;
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].id).toBe('2');
    });
  });

  describe('updateTask', () => {
    it('should update task', async () => {
      const updatedTask: Task = { ...mockTasks[0], title: 'Tarefa Atualizada' };
      (api.put as jest.Mock).mockResolvedValueOnce(updatedTask);

      store = createTestStore();
      store.dispatch({ type: 'tasks/fetchTasks/fulfilled', payload: mockTasks });

      await store.dispatch(updateTask({ id: '1', data: { title: 'Tarefa Atualizada' } }));

      const state = store.getState().tasks;
      expect(state.tasks[0].title).toBe('Tarefa Atualizada');
    });
  });

  describe('Reducers', () => {
    it('should set filter', () => {
      store.dispatch(setFilter('active'));
      expect(store.getState().tasks.filter).toBe('active');
    });

    it('should set search query', () => {
      store.dispatch(setSearchQuery('teste'));
      expect(store.getState().tasks.searchQuery).toBe('teste');
    });

    it('should clear error', () => {
      store.dispatch({ type: 'tasks/createTask/rejected', error: { message: 'Error' } });
      expect(store.getState().tasks.error).toBe('Error');

      store.dispatch(clearError());
      expect(store.getState().tasks.error).toBeNull();
    });
  });
});

import { api, ApiClientError, setAuthToken, getAuthToken } from '../../services/api';

// Mock do fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Garantir que sessionStorage esteja limpo e funcional
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });
    vi.clearAllMocks();
  });

  describe('Token Management', () => {
    it('should store token in sessionStorage', () => {
      setAuthToken('test-token');
      expect(getAuthToken()).toBe('test-token');
    });

    it('should remove token when null is passed', () => {
      setAuthToken('test-token');
      setAuthToken(null);
      expect(getAuthToken()).toBeNull();
    });

    it('should return null when no token is set', () => {
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('GET requests', () => {
    it('should make GET request and return data', async () => {
      const mockData = [{ id: '1', title: 'Test' }];
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await api.get('/api/tasks');
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('should include auth token in headers when available', async () => {
      setAuthToken('my-token');
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ([]),
      });

      await api.get('/api/tasks');
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer my-token');
    });

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await api.delete('/api/tasks/1');
      expect(result).toBeUndefined();
    });

    it('should handle 404 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(api.get('/api/tasks/999')).rejects.toThrow(ApiClientError);
    });

    it('should handle 500 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      try {
        await api.get('/api/tasks');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).status).toBe(500);
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));

      await expect(api.get('/api/tasks')).rejects.toThrow('Network failure');
    });
  });

  describe('POST requests', () => {
    it('should make POST request with JSON body', async () => {
      const mockData = { id: '1', title: 'New Task' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const result = await api.post('/api/tasks', { title: 'New Task' });
      expect(result).toEqual(mockData);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(options.body).toBe(JSON.stringify({ title: 'New Task' }));
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with JSON body', async () => {
      const mockData = { id: '1', title: 'Updated' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await api.put('/api/tasks/1', { title: 'Updated' });
      expect(result).toEqual(mockData);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('PUT');
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request', async () => {
      const mockData = { id: '1', completed: true };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await api.patch('/api/tasks/1/toggle');
      expect(result).toEqual(mockData);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('PATCH');
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      await api.delete('/api/tasks/1');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('DELETE');
    });
  });

  describe('ApiClientError', () => {
    it('should create error with status and message', () => {
      const error = new ApiClientError({
        status: 403,
        message: 'Forbidden',
        details: { reason: 'not_authorized' },
      });

      expect(error.status).toBe(403);
      expect(error.message).toBe('Forbidden');
      expect(error.details).toEqual({ reason: 'not_authorized' });
      expect(error.name).toBe('ApiClientError');
    });
  });
});

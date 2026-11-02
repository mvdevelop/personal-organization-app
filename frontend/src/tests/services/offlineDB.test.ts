import { ApiClientError, api } from '../../services/api'
import {
  enqueueSync,
  getSyncQueue,
  incrementRetry,
  processSyncQueue,
  removeSyncItem,
} from '../../services/offlineDB'

vi.mock('../../services/api', () => ({
  ApiClientError: class ApiClientError extends Error {
    status: number

    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
  api: {
    request: vi.fn(),
  },
}))

const mockedRequest = vi.mocked(api.request)

function createStorage() {
  const values = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
    clear: vi.fn(() => values.clear()),
  }
}

describe('offline sync queue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createStorage(),
    })
  })

  it('stores and removes a pending mutation without storing auth headers', () => {
    const id = enqueueSync({
      method: 'POST',
      url: '/api/tasks',
      body: { title: 'Tarefa offline' },
    })

    expect(getSyncQueue()).toEqual([
      expect.objectContaining({
        id,
        method: 'POST',
        url: '/api/tasks',
        body: { title: 'Tarefa offline' },
        retryCount: 0,
      }),
    ])
    expect(JSON.stringify(getSyncQueue())).not.toContain('Authorization')

    removeSyncItem(id)
    expect(getSyncQueue()).toEqual([])
  })

  it('records retry errors and keeps failed items for manual review', () => {
    const id = enqueueSync({ method: 'DELETE', url: '/api/tasks/1' })

    incrementRetry(id, '403: CSRF token inválido')
    incrementRetry(id, '403: CSRF token inválido')
    incrementRetry(id, '403: CSRF token inválido')

    expect(getSyncQueue()).toEqual([
      expect.objectContaining({
        id,
        retryCount: 3,
        failed: true,
        lastError: '403: CSRF token inválido',
      }),
    ])
  })

  it('replays mutations through the authenticated API client and removes successes', async () => {
    const id = enqueueSync({
      method: 'PATCH',
      url: '/api/tasks/1/toggle',
      body: { completed: true },
    })
    mockedRequest.mockResolvedValueOnce(undefined)

    await processSyncQueue()

    expect(mockedRequest).toHaveBeenCalledWith('/api/tasks/1/toggle', {
      method: 'PATCH',
      body: JSON.stringify({ completed: true }),
    })
    expect(getSyncQueue()).toEqual([])
    expect(id).toBeTruthy()
  })

  it('keeps a failed request in the queue with an actionable error', async () => {
    const id = enqueueSync({ method: 'PUT', url: '/api/tasks/1', body: { title: 'Atualizada' } })
    mockedRequest.mockRejectedValueOnce(new ApiClientError(403, 'CSRF token inválido'))
    vi.spyOn(window, 'setTimeout').mockImplementation((callback) => {
      callback()
      return 0 as unknown as number
    })

    await processSyncQueue()

    expect(getSyncQueue()).toEqual([
      expect.objectContaining({
        id,
        retryCount: 1,
        lastError: '403: CSRF token inválido',
        failed: false,
      }),
    ])
  })
})

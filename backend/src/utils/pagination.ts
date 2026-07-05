export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Parse pagination query params from a request query object.
 */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string, 10) || DEFAULT_PAGE)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit as string, 10) || DEFAULT_LIMIT))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

/**
 * Wrap an array of results with pagination metadata.
 */
export function paginatedResponse<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
      hasMore: params.page * params.limit < total,
    },
  }
}

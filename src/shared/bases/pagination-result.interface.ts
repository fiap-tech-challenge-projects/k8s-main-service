/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

import { applyDecorators } from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'

/**
 * Decorator for pagination query parameters
 * Provides consistent pagination parameters across all controllers
 * @returns Decorator function for pagination query parameters
 */
export function paginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (1-based, default: 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page (default: 10, max: 100)',
      example: 10,
    }),
  )
}

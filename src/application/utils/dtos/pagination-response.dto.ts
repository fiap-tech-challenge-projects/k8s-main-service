import { ApiProperty } from '@nestjs/swagger'

/**
 * Pagination metadata DTO
 */
export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNext: boolean

  @ApiProperty({ description: 'Whether there is a previous page', example: false })
  hasPrev: boolean
}

/**
 * Generic paginated response DTO
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
  })
  data: T[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

/**
 * Generic paginated response DTO for any entity
 */
export class PaginatedResponse<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
  })
  data: T[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

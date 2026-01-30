import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils'
import { PaginatedResult } from '@shared'

import { ClientResponseDto } from './client-response.dto'

/**
 * Paginated response DTO for clients
 */
export class PaginatedClientsResponseDto implements PaginatedResult<ClientResponseDto> {
  @ApiProperty({
    description: 'Array of clients for the current page',
    type: [ClientResponseDto],
  })
  data: ClientResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils'
import { PaginatedResult } from '@shared'

import { ServiceResponseDto } from './service-response.dto'

/**
 * Paginated response DTO for services
 */
export class PaginatedServicesResponseDto implements PaginatedResult<ServiceResponseDto> {
  @ApiProperty({
    description: 'Array of services for the current page',
    type: [ServiceResponseDto],
  })
  data: ServiceResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

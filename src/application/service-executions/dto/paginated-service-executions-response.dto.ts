import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils/dtos'
import { PaginatedResult } from '@shared'

import { ServiceExecutionResponseDto } from './service-execution-response.dto'

/**
 * Paginated response DTO for service executions
 */
export class PaginatedServiceExecutionsResponseDto implements PaginatedResult<ServiceExecutionResponseDto> {
  @ApiProperty({
    description: 'Array of service executions for the current page',
    type: [ServiceExecutionResponseDto],
  })
  data: ServiceExecutionResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

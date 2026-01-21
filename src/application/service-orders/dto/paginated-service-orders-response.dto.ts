import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils'
import { PaginatedResult } from '@shared'

import { ServiceOrderResponseDto } from './service-order-response.dto'

/**
 * Paginated response DTO for service orders
 */
export class PaginatedServiceOrdersResponseDto implements PaginatedResult<ServiceOrderResponseDto> {
  @ApiProperty({ type: [ServiceOrderResponseDto] })
  data: ServiceOrderResponseDto[]

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto
}

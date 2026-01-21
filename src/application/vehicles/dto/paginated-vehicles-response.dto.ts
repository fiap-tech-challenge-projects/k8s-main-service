import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils'
import { PaginatedResult } from '@shared'

import { VehicleResponseDto } from './vehicle-response.dto'

/**
 * Response DTO for paginated vehicle data
 */
export class PaginatedVehiclesResponseDto implements PaginatedResult<VehicleResponseDto> {
  @ApiProperty({
    description: 'Array of vehicles',
    type: [VehicleResponseDto],
  })
  data: VehicleResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

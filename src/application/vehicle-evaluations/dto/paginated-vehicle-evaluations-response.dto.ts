import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils/dtos'
import { PaginatedResult } from '@shared'

import { VehicleEvaluationResponseDto } from './vehicle-evaluation-response.dto'

/**
 * Paginated response DTO for vehicle evaluations
 */
export class PaginatedVehicleEvaluationsResponseDto implements PaginatedResult<VehicleEvaluationResponseDto> {
  @ApiProperty({
    description: 'Array of vehicle evaluations for the current page',
    type: [VehicleEvaluationResponseDto],
  })
  data: VehicleEvaluationResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

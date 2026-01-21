import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils'
import { PaginatedResult } from '@shared/bases'

import { EmployeeResponseDto } from './employee-response.dto'

/**
 * DTO for paginated employees response
 */
export class PaginatedEmployeesResponseDto implements PaginatedResult<EmployeeResponseDto> {
  @ApiProperty({
    description: 'Array of employees',
    type: [EmployeeResponseDto],
  })
  data: EmployeeResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

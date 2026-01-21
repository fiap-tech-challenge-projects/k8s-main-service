import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils'
import { PaginatedResult } from '@shared'

import { BudgetResponseDto } from './budget-response.dto'

/**
 * Response DTO for paginated budget data
 */
export class PaginatedBudgetsResponseDto implements PaginatedResult<BudgetResponseDto> {
  @ApiProperty({
    description: 'Array of budgets',
    type: [BudgetResponseDto],
  })
  data: BudgetResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

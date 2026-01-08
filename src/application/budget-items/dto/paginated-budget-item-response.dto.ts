import { ApiProperty } from '@nestjs/swagger'

import { PaginationMetaDto } from '@application/utils'
import { PaginatedResult } from '@shared'

import { BudgetItemResponseDto } from './budget-item-response.dto'

/**
 * Response DTO for paginated budget item data
 */
export class PaginatedBudgetItemsResponseDto implements PaginatedResult<BudgetItemResponseDto> {
  @ApiProperty({
    description: 'Array of budget items',
    type: [BudgetItemResponseDto],
  })
  data: BudgetItemResponseDto[]

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto
}

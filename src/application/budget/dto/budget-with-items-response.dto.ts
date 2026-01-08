import { ApiProperty } from '@nestjs/swagger'

import { BudgetItemResponseDto } from '@application/budget-items/dto'

import { BudgetResponseDto } from './budget-response.dto'

/**
 * Data Transfer Object for budget responses that include budget items
 */
export class BudgetWithItemsResponseDto extends BudgetResponseDto {
  @ApiProperty({
    description: 'Budget items associated with this budget',
    type: [BudgetItemResponseDto],
  })
  budgetItems: BudgetItemResponseDto[]
}

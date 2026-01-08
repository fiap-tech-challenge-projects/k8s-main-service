import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Data Transfer Object for budget item responses
 */
export class BudgetItemResponseDto {
  @ApiProperty({ description: 'ID of the budget item', example: 'item_123456' })
  id: string

  @ApiProperty({
    description: 'Type of the budget item',
    enum: ['service', 'part'],
    example: 'service',
  })
  type: string

  @ApiProperty({ description: 'Description of the budget item', example: 'Oil change' })
  description: string

  @ApiProperty({ description: 'Quantity of the budget item', example: 1 })
  quantity: number

  @ApiProperty({ description: 'Unit price of the budget item', example: 'R$100,00' })
  unitPrice: string

  @ApiProperty({ description: 'Total price of the budget item', example: 'R$100,00' })
  totalPrice: string

  @ApiProperty({ description: 'ID of the associated budget', example: 'budget_123456' })
  budgetId: string

  @ApiPropertyOptional({ description: 'Notes about the budget item', example: 'Premium oil' })
  notes?: string

  @ApiPropertyOptional({
    description: 'ID of the associated stock item',
    example: 'stock_item_123456',
  })
  stockItemId?: string

  @ApiPropertyOptional({
    description: 'ID of the associated service',
    example: 'service_123456',
  })
  serviceId?: string

  @ApiProperty({ description: 'Creation date of the budget item' })
  createdAt: Date

  @ApiPropertyOptional({ description: 'Last update date of the budget item' })
  updatedAt?: Date
}

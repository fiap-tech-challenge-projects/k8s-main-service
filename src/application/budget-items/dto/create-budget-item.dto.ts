import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BudgetItemType } from '@prisma/client'
import { IsString, IsOptional, IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator'

import { IsValidPrice } from '@shared/validators'

import { IsValidBudgetItemType } from '../validators'

/**
 * Data Transfer Object for creating a budget item
 */
export class CreateBudgetItemDto {
  @ApiProperty({
    description: 'Type of the budget item',
    enum: BudgetItemType,
    example: BudgetItemType.SERVICE,
  })
  @IsEnum(BudgetItemType)
  @IsValidBudgetItemType()
  type: BudgetItemType

  @ApiProperty({
    description: 'Description of the budget item',
    example: 'Oil change',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'Quantity of the budget item',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number

  @ApiProperty({
    description:
      'Unit price of the budget item (accepts multiple formats: R$1000.00, 100000, 1000.00, 1000,00, R$1.000,00, R$1,000.00)',
    example: 'R$100.00',
  })
  @IsNotEmpty()
  @IsValidPrice()
  unitPrice: string

  @ApiProperty({
    description: 'ID of the budget',
    example: 'budget-123456',
  })
  @IsString()
  @IsNotEmpty()
  budgetId: string

  @ApiPropertyOptional({
    description: 'Additional notes for the budget item',
    example: 'Use synthetic oil',
  })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({
    description: 'ID of the stock item (required when type is STOCK_ITEM)',
    example: 'stock-item-123456',
  })
  @IsOptional()
  @IsString()
  stockItemId?: string

  @ApiPropertyOptional({
    description: 'ID of the service (required when type is SERVICE)',
    example: 'service-123456',
  })
  @IsOptional()
  @IsString()
  serviceId?: string
}

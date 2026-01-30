import { ApiPropertyOptional } from '@nestjs/swagger'
import { BudgetItemType } from '@prisma/client'
import { IsEnum, IsOptional, IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator'

import { IsValidPrice } from '@shared/validators'

import { IsValidBudgetItemType } from '../validators'

/**
 * Data Transfer Object for updating budget items
 */
export class UpdateBudgetItemDto {
  @ApiPropertyOptional({
    description: 'Type of the budget item',
    enum: BudgetItemType,
    example: BudgetItemType.SERVICE,
  })
  @IsOptional()
  @IsEnum(BudgetItemType)
  @IsValidBudgetItemType()
  type?: BudgetItemType

  @ApiPropertyOptional({ description: 'Description of the budget item', example: 'Oil change' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string

  @ApiPropertyOptional({ description: 'Quantity of the budget item', example: 1 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number

  @ApiPropertyOptional({ description: 'Unit price...', example: 'R$100.00' })
  @IsOptional()
  @IsValidPrice()
  unitPrice?: string

  @ApiPropertyOptional({ description: 'Notes about the budget item', example: 'Premium oil' })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({
    description: 'ID of the associated stock item (required when type is STOCK_ITEM)',
    example: 'stock_item_123456',
  })
  @IsOptional()
  @IsString()
  stockItemId?: string

  @ApiPropertyOptional({
    description: 'ID of the associated service (required when type is SERVICE)',
    example: 'service_123456',
  })
  @IsOptional()
  @IsString()
  serviceId?: string
}

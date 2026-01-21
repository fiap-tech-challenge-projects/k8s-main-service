import { ApiPropertyOptional } from '@nestjs/swagger'
import { BudgetStatus, DeliveryMethod } from '@prisma/client'
import { IsEnum, IsOptional, IsString, IsPositive, IsInt } from 'class-validator'

import { IsValidPrice } from '@shared/validators'

/**
 * Data Transfer Object for updating an existing budget
 */
export class UpdateBudgetDto {
  @ApiPropertyOptional({
    description: 'Budget status',
    enum: BudgetStatus,
    example: BudgetStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus

  @ApiPropertyOptional({ description: 'Total amount...', example: 'R$1.000,00' })
  @IsOptional()
  @IsValidPrice()
  totalAmount?: string

  @ApiPropertyOptional({ description: 'Validity period in days', example: 7 })
  @IsOptional()
  @IsPositive()
  @IsInt()
  validityPeriod?: number

  @ApiPropertyOptional({
    description: 'Date when budget was sent',
    example: '2024-08-03T10:30:00.000Z',
  })
  @IsOptional()
  sentDate?: Date

  @ApiPropertyOptional({
    description: 'Date when budget was approved',
    example: '2024-08-04T11:00:00.000Z',
  })
  @IsOptional()
  approvalDate?: Date

  @ApiPropertyOptional({
    description: 'Date when budget was rejected',
    example: '2024-08-04T11:00:00.000Z',
  })
  @IsOptional()
  rejectionDate?: Date

  @ApiPropertyOptional({
    description: 'Delivery method...',
    enum: DeliveryMethod,
    example: DeliveryMethod.EMAIL,
  })
  @IsOptional()
  @IsEnum(DeliveryMethod)
  deliveryMethod?: DeliveryMethod

  @ApiPropertyOptional({
    description: 'Notes about the budget',
    example: 'Express delivery requested',
  })
  @IsOptional()
  @IsString()
  notes?: string
}

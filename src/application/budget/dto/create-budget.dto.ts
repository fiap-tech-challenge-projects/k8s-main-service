import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DeliveryMethod } from '@prisma/client'
import { IsString, IsOptional, IsNotEmpty, IsPositive, IsInt, IsEnum } from 'class-validator'

import { IsValidPrice } from '@shared/validators'

/**
 * Data Transfer Object for creating a new budget
 */
export class CreateBudgetDto {
  @ApiPropertyOptional({
    description: 'Total amount (optional, will be calculated from budget items)',
    example: 'R$1.000,00',
  })
  @IsOptional()
  @IsValidPrice()
  totalAmount?: string

  @ApiPropertyOptional({ description: 'Validity period in days', example: 7 })
  @IsOptional()
  @IsPositive()
  @IsInt()
  validityPeriod?: number

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

  @ApiProperty({ description: 'ID of the service order', example: 'so_123456' })
  @IsString()
  @IsNotEmpty()
  serviceOrderId: string

  @ApiProperty({ description: 'ID of the client', example: 'cli_123456' })
  @IsString()
  @IsNotEmpty()
  clientId: string
}

import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsNotEmpty } from 'class-validator'

import { IsValidPrice, isValidEstimatedDuration } from '@domain/services/validators'

/**
 * Data Transfer Object for updating an existing service
 */
export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Service name',
    example: 'Oil Change',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string

  @ApiPropertyOptional({
    description:
      'Service price (accepts multiple formats: R$1000.00, 100000, 1000.00, 1000,00, R$1.000,00, R$1,000.00)',
    example: 'R$100.00',
  })
  @IsOptional()
  @IsValidPrice()
  price?: string

  @ApiPropertyOptional({
    description: 'Service description',
    example: 'Complete oil change service',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string

  @ApiPropertyOptional({
    description: 'Estimated duration in HH:MM:SS format or hours as number',
    example: '00:30:00',
  })
  @IsOptional()
  @isValidEstimatedDuration()
  estimatedDuration?: string
}

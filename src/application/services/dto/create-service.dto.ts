import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

import { IsValidPrice, isValidEstimatedDuration } from '@domain/services/validators'

/**
 * Data Transfer Object for creating a new service
 */
export class CreateServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Oil Change',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description:
      'Service price (accepts multiple formats: R$1000.00, 100000, 1000.00, 1000,00, R$1.000,00, R$1,000.00)',
    example: 'R$100.00',
  })
  @IsNotEmpty()
  @IsValidPrice()
  price: string

  @ApiProperty({
    description: 'Service description',
    example: 'Complete oil change service',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiPropertyOptional({
    description: 'Estimated duration in HH:MM:SS format or hours as number',
    example: '00:30:00',
  })
  @IsOptional()
  @isValidEstimatedDuration()
  estimatedDuration?: string
}

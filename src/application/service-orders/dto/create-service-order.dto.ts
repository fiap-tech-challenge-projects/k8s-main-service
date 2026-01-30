import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * DTO for creating a service order
 */
export class CreateServiceOrderDto {
  @ApiProperty({
    description:
      'Vehicle unique identifier. The client will be automatically determined from the vehicle.',
    example: 'vehicle-4567890123-def456ghi',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  vehicleId: string

  @ApiPropertyOptional({
    description: 'Additional notes or special instructions for the service order',
    example:
      'Customer reported engine noise and reduced performance. Check for oil leaks and perform diagnostic scan.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string
}

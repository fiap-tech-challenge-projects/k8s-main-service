import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

/**
 * DTO for creating a new vehicle evaluation
 */
export class CreateVehicleEvaluationDto {
  @ApiProperty({
    description: 'Associated service order ID',
    example: 'so1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  serviceOrderId: string

  @ApiProperty({
    description: 'Associated vehicle ID',
    example: 'v1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  vehicleId: string

  @ApiProperty({
    description: 'Vehicle evaluation details',
    example: {
      engineCondition: 'Good',
      brakeCondition: 'Needs replacement',
      tireCondition: 'Good',
      mileage: 50000,
    },
  })
  @IsObject()
  details: Record<string, unknown>

  @ApiPropertyOptional({
    description: 'Mechanic notes about the evaluation',
    example: 'Brake pads at 20% remaining, recommend replacement',
  })
  @IsOptional()
  @IsString()
  mechanicNotes?: string
}

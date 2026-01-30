import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString } from 'class-validator'

/**
 * DTO for updating a vehicle evaluation
 */
export class UpdateVehicleEvaluationDto {
  @ApiPropertyOptional({
    description: 'Vehicle evaluation details',
    example: {
      engineCondition: 'Good',
      brakeCondition: 'Needs replacement',
      tireCondition: 'Good',
      mileage: 50000,
    },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>

  @ApiPropertyOptional({
    description: 'Mechanic notes about the evaluation',
    example: 'Brake pads at 20% remaining, recommend replacement',
  })
  @IsOptional()
  @IsString()
  mechanicNotes?: string
}

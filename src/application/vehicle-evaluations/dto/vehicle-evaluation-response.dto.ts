import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * DTO for vehicle evaluation response
 */
export class VehicleEvaluationResponseDto {
  @ApiProperty({
    description: 'Vehicle evaluation unique identifier',
    example: 've1234567890abcdef',
  })
  id: string

  @ApiProperty({
    description: 'Vehicle evaluation details',
    example: {
      engineCondition: 'Good',
      brakeCondition: 'Needs replacement',
      tireCondition: 'Good',
      mileage: 50000,
    },
  })
  details: Record<string, unknown>

  @ApiProperty({
    description: 'Vehicle evaluation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  evaluationDate: Date

  @ApiPropertyOptional({
    description: 'Mechanic notes about the evaluation',
    example: 'Brake pads at 20% remaining, recommend replacement',
  })
  mechanicNotes?: string

  @ApiProperty({
    description: 'Associated service order ID',
    example: 'so1234567890abcdef',
  })
  serviceOrderId: string

  @ApiProperty({
    description: 'Associated vehicle ID',
    example: 'v1234567890abcdef',
  })
  vehicleId: string

  @ApiProperty({
    description: 'Vehicle evaluation creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Vehicle evaluation last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date
}

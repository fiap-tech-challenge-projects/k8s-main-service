import { ApiProperty } from '@nestjs/swagger'

/**
 * Response DTO for vehicle data
 */
export class VehicleResponseDto {
  @ApiProperty({
    description: 'Vehicle unique identifier',
    example: 'vehicle-1234567890-abc123def',
  })
  id: string

  @ApiProperty({
    description: 'Vehicle license plate',
    example: 'ABC-1234',
  })
  licensePlate: string

  @ApiProperty({
    description: 'Vehicle make/brand',
    example: 'Toyota',
  })
  make: string

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Corolla',
  })
  model: string

  @ApiProperty({
    description: 'Vehicle manufacturing year',
    example: 2020,
  })
  year: number

  @ApiProperty({
    description: 'Vehicle Identification Number (VIN)',
    example: '1HGBH41JXMN109186',
    required: false,
  })
  vin?: string

  @ApiProperty({
    description: 'Vehicle color',
    example: 'White',
    required: false,
  })
  color?: string

  @ApiProperty({
    description: 'Client ID who owns the vehicle',
    example: 'client-1234567890-abc123def',
  })
  clientId: string

  @ApiProperty({
    description: 'Vehicle registration date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Vehicle last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date
}

import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, Max } from 'class-validator'

import { IsLicensePlate, IsVin } from '@domain/vehicles/validators'

/**
 * DTO for creating a new vehicle
 */
export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle license plate',
    example: 'ABC-1234',
  })
  @IsLicensePlate()
  @IsNotEmpty()
  licensePlate: string

  @ApiProperty({
    description: 'Vehicle make/brand',
    example: 'Toyota',
  })
  @IsString()
  @IsNotEmpty()
  make: string

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Corolla',
  })
  @IsString()
  @IsNotEmpty()
  model: string

  @ApiProperty({
    description: 'Vehicle manufacturing year',
    example: 2020,
    minimum: 1900,
    maximum: 2030,
  })
  @IsNumber()
  @Min(1900)
  @Max(2030)
  year: number

  @ApiProperty({
    description: 'Client ID who owns the vehicle',
    example: 'client-1234567890-abc123def',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string

  @ApiProperty({
    description: 'Vehicle Identification Number (VIN)',
    example: '1HGBH41JXMN109186',
    required: false,
  })
  @IsOptional()
  @IsVin()
  vin?: string

  @ApiProperty({
    description: 'Vehicle color',
    example: 'White',
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string
}

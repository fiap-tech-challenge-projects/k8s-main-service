import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator'

import { IsLicensePlate, IsVin } from '@domain/vehicles/validators'

/**
 * DTO for updating an existing vehicle
 */
export class UpdateVehicleDto {
  @ApiProperty({
    description: 'Vehicle license plate',
    example: 'ABC-1234',
    required: false,
  })
  @IsOptional()
  @IsLicensePlate()
  licensePlate?: string

  @ApiProperty({
    description: 'Vehicle make/brand',
    example: 'Toyota',
    required: false,
  })
  @IsOptional()
  @IsString()
  make?: string

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Corolla',
    required: false,
  })
  @IsOptional()
  @IsString()
  model?: string

  @ApiProperty({
    description: 'Vehicle manufacturing year',
    example: 2020,
    minimum: 1900,
    maximum: 2030,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2030)
  year?: number

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

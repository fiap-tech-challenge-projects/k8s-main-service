import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

/**
 * DTO for creating a new service execution
 */
export class CreateServiceExecutionDto {
  @ApiProperty({
    description: 'Associated service order ID',
    example: 'so1234567890abcdef',
  })
  @IsString()
  serviceOrderId: string

  @ApiPropertyOptional({
    description: 'Assigned mechanic ID',
    example: 'emp1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  mechanicId?: string

  @ApiPropertyOptional({
    description: 'Service execution notes',
    example: 'Oil change completed, filter replaced',
  })
  @IsOptional()
  @IsString()
  notes?: string
}

import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

/**
 * DTO for updating a service execution
 */
export class UpdateServiceExecutionDto {
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

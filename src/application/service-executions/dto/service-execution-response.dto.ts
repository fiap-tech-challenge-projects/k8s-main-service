import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * DTO for service execution response
 */
export class ServiceExecutionResponseDto {
  @ApiProperty({
    description: 'Service execution unique identifier',
    example: 'se1234567890abcdef',
  })
  id: string

  @ApiProperty({
    description: 'Service execution status',
    example: 'IN_PROGRESS',
    enum: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'],
  })
  status: string

  @ApiPropertyOptional({
    description: 'Service execution start time',
    example: '2024-01-15T10:30:00.000Z',
  })
  startTime?: Date

  @ApiPropertyOptional({
    description: 'Service execution end time',
    example: '2024-01-15T12:30:00.000Z',
  })
  endTime?: Date

  @ApiPropertyOptional({
    description: 'Service execution notes',
    example: 'Oil change completed, filter replaced',
  })
  notes?: string

  @ApiProperty({
    description: 'Associated service order ID',
    example: 'so1234567890abcdef',
  })
  serviceOrderId: string

  @ApiPropertyOptional({
    description: 'Assigned mechanic ID',
    example: 'emp1234567890abcdef',
  })
  mechanicId?: string

  @ApiPropertyOptional({
    description: 'Service execution duration in minutes',
    example: 120,
  })
  durationInMinutes?: number

  @ApiProperty({
    description: 'Service execution creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Service execution last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date
}

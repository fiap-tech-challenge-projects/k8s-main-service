import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * DTO for service response data
 */
/**
 * DTO for service response data
 */
export class ServiceResponseDto {
  @ApiProperty({
    description: 'Service unique identifier',
    example: 'srv1234567890abcdef',
  })
  id: string

  @ApiProperty({
    description: 'Service name',
    example: 'Troca de Óleo',
  })
  name: string

  @ApiProperty({
    description: 'Service description',
    example: 'Troca de óleo do motor',
  })
  description: string

  @ApiProperty({
    description: 'Service price',
    example: '1.000,00',
  })
  price: string

  @ApiPropertyOptional({
    description: 'Service duration in minutes',
    example: '00:60',
  })
  estimatedDuration: string

  @ApiProperty({
    description: 'Service creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Service last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date

  @ApiPropertyOptional({
    description: 'Service status (e.g., active, inactive)',
    example: 'active',
  })
  status?: string
}

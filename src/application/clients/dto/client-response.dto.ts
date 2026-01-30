import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * DTO for client response data
 */
export class ClientResponseDto {
  @ApiProperty({
    description: 'Client unique identifier',
    example: 'clh1234567890abcdef',
  })
  id: string

  @ApiProperty({
    description: 'Client full name',
    example: 'João Silva',
  })
  name: string

  @ApiProperty({
    description: 'Client email address',
    example: 'joao.silva@email.com',
  })
  email: string

  @ApiProperty({
    description: 'Client CPF or CNPJ (formatted)',
    example: '123.456.789-00',
  })
  cpfCnpj: string

  @ApiPropertyOptional({
    description: 'Client phone number',
    example: '+55 11 99999 9999',
  })
  phone?: string

  @ApiPropertyOptional({
    description: 'Client address',
    example: 'Rua das Flores, 123 - São Paulo, SP',
  })
  address?: string

  @ApiProperty({
    description: 'Client registration date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Client last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date
}

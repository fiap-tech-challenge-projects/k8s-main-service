import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsEmail, IsOptional, MinLength, IsMobilePhone } from 'class-validator'

/**
 * DTO for updating an existing client
 */
export class UpdateClientDto {
  @ApiPropertyOptional({
    description: 'Client full name',
    example: 'João Silva',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @ApiPropertyOptional({
    description: 'Client email address',
    example: 'joao.silva@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({
    description: 'Client phone number',
    example: '+55 11 99999-9999',
  })
  @IsOptional()
  @IsString()
  @IsMobilePhone('pt-BR')
  phone?: string

  @ApiPropertyOptional({
    description: 'Client address',
    example: 'Rua das Flores, 123 - São Paulo, SP',
  })
  @IsOptional()
  @IsString()
  address?: string
}

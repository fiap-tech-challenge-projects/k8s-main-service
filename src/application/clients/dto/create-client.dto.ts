import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsOptional,
  MinLength,
  IsNotEmpty,
  IsEmail,
  IsMobilePhone,
} from 'class-validator'

import { IsCpfCnpj } from '@domain/clients/validators'

/**
 * DTO for creating a new client
 */
export class CreateClientDto {
  @ApiProperty({
    description: 'Client full name',
    example: 'João Silva',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string

  @ApiProperty({
    description: 'Client email address',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Client CPF or CNPJ (Brazilian taxpayer registration)',
    example: '123.456.789-00',
  })
  @IsString()
  @IsNotEmpty()
  @IsCpfCnpj()
  cpfCnpj: string

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

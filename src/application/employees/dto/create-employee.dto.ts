import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsOptional,
  MinLength,
  IsNotEmpty,
  IsBoolean,
  IsEmail,
  IsMobilePhone,
} from 'class-validator'

/**
 * DTO for creating a new employee
 */
export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Employee full name',
    example: 'João Silva',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string

  @ApiProperty({
    description: 'Employee email address',
    example: 'joao.silva@workshop.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Employee role in the workshop',
    example: 'Mechanic',
  })
  @IsString()
  @IsNotEmpty()
  role: string

  @ApiPropertyOptional({
    description: 'Employee phone number',
    example: '+55 11 99999-9999',
  })
  @IsOptional()
  @IsString()
  @IsMobilePhone('pt-BR')
  phone?: string

  @ApiPropertyOptional({
    description: 'Employee specialty or area of expertise',
    example: 'Engine Repair',
  })
  @IsOptional()
  @IsString()
  specialty?: string

  @ApiPropertyOptional({
    description: 'Whether the employee is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

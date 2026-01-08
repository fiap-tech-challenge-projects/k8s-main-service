import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, MinLength, IsBoolean, IsEmail, IsMobilePhone } from 'class-validator'

/**
 * DTO for updating an existing employee
 */
export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    description: 'Employee full name',
    example: 'João Silva',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @ApiPropertyOptional({
    description: 'Employee email address',
    example: 'joao.silva@workshop.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({
    description: 'Employee role in the workshop',
    example: 'Mechanic',
  })
  @IsOptional()
  @IsString()
  role?: string

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
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

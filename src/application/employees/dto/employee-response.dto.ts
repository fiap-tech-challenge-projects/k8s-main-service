import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO for employee response
 */
export class EmployeeResponseDto {
  @ApiProperty({
    description: 'Employee unique identifier',
    example: 'employee-1234567890-abc123def',
  })
  id: string

  @ApiProperty({
    description: 'Employee full name',
    example: 'João Silva',
  })
  name: string

  @ApiProperty({
    description: 'Employee email address',
    example: 'joao.silva@workshop.com',
  })
  email: string

  @ApiProperty({
    description: 'Employee role in the workshop',
    example: 'Mechanic',
  })
  role: string

  @ApiProperty({
    description: 'Employee phone number',
    example: '+55 11 99999 9999',
    nullable: true,
  })
  phone: string | undefined

  @ApiProperty({
    description: 'Employee specialty or area of expertise',
    example: 'Engine Repair',
    nullable: true,
  })
  specialty: string | null

  @ApiProperty({
    description: 'Whether the employee is active',
    example: true,
  })
  isActive: boolean

  @ApiProperty({
    description: 'Employee creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Employee last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date
}

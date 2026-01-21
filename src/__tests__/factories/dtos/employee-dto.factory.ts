import { plainToClass } from 'class-transformer'

import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeResponseDto,
  PaginatedEmployeesResponseDto,
} from '@application/employees/dto'

/**
 * Factory for creating Employee DTOs for testing
 */
export class EmployeeDtoFactory {
  /**
   * Create a valid CreateEmployeeDto
   * @param overrides - Optional properties to override defaults
   * @returns CreateEmployeeDto
   */
  public static createCreateEmployeeDto(
    overrides: Partial<CreateEmployeeDto> = {},
  ): CreateEmployeeDto {
    const defaults: CreateEmployeeDto = {
      name: 'Carlos Mechanic',
      email: 'carlos.mechanic@workshop.com',
      role: 'Mechanic',
      phone: '11988887777',
      specialty: 'Engine Repair',
      isActive: true,
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(CreateEmployeeDto, data)
  }

  /**
   * Create a minimal CreateEmployeeDto with only required fields
   * @param overrides - Optional properties to override defaults
   * @returns CreateEmployeeDto
   */
  public static createMinimalCreateEmployeeDto(
    overrides: Partial<CreateEmployeeDto> = {},
  ): CreateEmployeeDto {
    const defaults: CreateEmployeeDto = {
      name: 'Ana Supervisor',
      email: 'ana.supervisor@workshop.com',
      role: 'Supervisor',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(CreateEmployeeDto, data)
  }

  /**
   * Create a CreateEmployeeDto with specific role
   * @param role - Employee role
   * @param overrides - Optional properties to override defaults
   * @returns CreateEmployeeDto
   */
  public static createCreateEmployeeDtoWithRole(
    role: string,
    overrides: Partial<CreateEmployeeDto> = {},
  ): CreateEmployeeDto {
    const roleBasedDefaults = {
      Manager: { name: 'Roberto Manager', specialty: 'Team Management' },
      Mechanic: { name: 'Paulo Mechanic', specialty: 'General Repair' },
      Electrician: { name: 'Lucas Electrician', specialty: 'Auto Electrical' },
      Supervisor: { name: 'Sandra Supervisor', specialty: 'Quality Control' },
    }

    const roleDefaults = roleBasedDefaults[role as keyof typeof roleBasedDefaults] || {}

    const data = { ...roleDefaults, ...overrides, role }
    data.email =
      overrides.email ?? `${roleDefaults.name?.toLowerCase().replace(' ', '.')}@workshop.com`
    return this.createCreateEmployeeDto(data)
  }

  /**
   * Create a valid UpdateEmployeeDto
   * @param overrides - Optional properties to override defaults
   * @returns UpdateEmployeeDto
   */
  public static createUpdateEmployeeDto(
    overrides: Partial<UpdateEmployeeDto> = {},
  ): UpdateEmployeeDto {
    const defaults: UpdateEmployeeDto = {
      name: 'Carlos Mechanic Updated',
      email: 'carlos.mechanic.updated@workshop.com',
      role: 'Senior Mechanic',
      phone: '1177778888',
      specialty: 'Advanced Engine Repair',
      isActive: true,
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateEmployeeDto, data)
  }

  /**
   * Create a partial UpdateEmployeeDto with only some fields
   * @param overrides - Optional properties to override defaults
   * @returns UpdateEmployeeDto
   */
  public static createPartialUpdateEmployeeDto(
    overrides: Partial<UpdateEmployeeDto> = {},
  ): UpdateEmployeeDto {
    const defaults: UpdateEmployeeDto = {
      name: 'Updated Name',
      specialty: 'Updated Specialty',
    }

    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateEmployeeDto, data)
  }

  /**
   * Create a valid EmployeeResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns EmployeeResponseDto
   */
  public static createEmployeeResponseDto(
    overrides: Partial<EmployeeResponseDto> = {},
  ): EmployeeResponseDto {
    const defaults: EmployeeResponseDto = {
      id: `employee-test-${Date.now()}`,
      name: 'Carlos Mechanic',
      email: 'carlos.mechanic@workshop.com',
      role: 'Mechanic',
      phone: '+55 11 98888 7777',
      specialty: 'Engine Repair',
      isActive: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    return { ...defaults, ...overrides }
  }

  /**
   * Create a minimal EmployeeResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns EmployeeResponseDto
   */
  public static createMinimalEmployeeResponseDto(
    overrides: Partial<EmployeeResponseDto> = {},
  ): EmployeeResponseDto {
    const defaults: EmployeeResponseDto = {
      id: `employee-test-${Date.now()}`,
      name: 'Ana Supervisor',
      email: 'ana.supervisor@workshop.com',
      role: 'Supervisor',
      phone: undefined,
      specialty: null,
      isActive: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    return { ...defaults, ...overrides }
  }

  /**
   * Create a PaginatedEmployeesResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns PaginatedEmployeesResponseDto
   */
  public static createPaginatedEmployeesResponseDto(
    overrides: Partial<{
      data: EmployeeResponseDto[]
      meta: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
      }
    }> = {},
  ): PaginatedEmployeesResponseDto {
    const employeesData = overrides.data ?? [
      this.createEmployeeResponseDto({ id: 'employee-1', name: 'Employee 1', role: 'Mechanic' }),
      this.createEmployeeResponseDto({ id: 'employee-2', name: 'Employee 2', role: 'Supervisor' }),
      this.createEmployeeResponseDto({ id: 'employee-3', name: 'Employee 3', role: 'Manager' }),
    ]

    const defaults = {
      data: employeesData,
      meta: {
        total: employeesData.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(employeesData.length / 10),
        hasNext: false,
        hasPrev: false,
      },
    }

    return {
      data: overrides.data ?? defaults.data,
      meta: overrides.meta ? { ...defaults.meta, ...overrides.meta } : defaults.meta,
    }
  }

  /**
   * Create an empty PaginatedEmployeesResponseDto
   * @returns PaginatedEmployeesResponseDto
   */
  public static createEmptyPaginatedEmployeesResponseDto(): PaginatedEmployeesResponseDto {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  }

  /**
   * Create multiple CreateEmployeeDto instances
   * @param count - Number of DTOs to create
   * @param baseOverrides - Base overrides to apply to all DTOs
   * @returns Array of CreateEmployeeDto
   */
  public static createManyCreateEmployeeDto(
    count: number,
    baseOverrides: Partial<CreateEmployeeDto> = {},
  ): CreateEmployeeDto[] {
    const roles = ['Mechanic', 'Supervisor', 'Manager', 'Electrician']

    return Array.from({ length: count }, (_, index) =>
      this.createCreateEmployeeDto({
        ...baseOverrides,
        name: `${baseOverrides.name ?? 'Employee'} ${index + 1}`,
        email: `${baseOverrides.email ?? `employee${index + 1}@workshop.com`}`,
        role: baseOverrides.role ?? roles[index % roles.length],
      }),
    )
  }
}

import { Employee } from '@domain/employees/entities'
import { Email } from '@shared'

/**
 * Factory for creating Employee entities for testing
 */
export class EmployeeFactory {
  /**
   * Create a valid Employee entity with default values
   * @param overrides - Optional properties to override defaults
   * @returns Employee entity
   */
  public static create(
    overrides: Partial<{
      id: string
      name: string
      email: string
      role: string
      phone?: string
      specialty?: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Employee {
    const defaults = {
      id: `employee-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Carlos Mechanic',
      email: 'carlos.mechanic@workshop.com',
      role: 'Mechanic',
      phone: '(11) 88888-7777',
      specialty: 'Engine Repair',
      isActive: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new Employee(
      data.id,
      data.name,
      Email.create(data.email),
      data.role,
      data.phone,
      data.specialty,
      data.isActive,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a minimal Employee entity with only required fields
   * @param overrides - Optional properties to override defaults
   * @returns Employee entity
   */
  public static createMinimal(
    overrides: Partial<{
      id: string
      name: string
      email: string
      role: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Employee {
    const defaults = {
      id: `employee-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Ana Supervisor',
      email: 'ana.supervisor@workshop.com',
      role: 'Supervisor',
      isActive: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new Employee(
      data.id,
      data.name,
      Email.create(data.email),
      data.role,
      undefined,
      undefined,
      data.isActive,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create an inactive Employee entity
   * @param overrides - Optional properties to override defaults
   * @returns Employee entity
   */
  public static createInactive(
    overrides: Partial<{
      id: string
      name: string
      email: string
      role: string
      phone?: string
      specialty?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Employee {
    return this.create({
      ...overrides,
      isActive: false,
    })
  }

  /**
   * Create an Employee entity with specific role
   * @param role - Employee role
   * @param overrides - Optional properties to override defaults
   * @returns Employee entity
   */
  public static createWithRole(
    role: string,
    overrides: Partial<{
      id: string
      name: string
      email: string
      phone?: string
      specialty?: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): Employee {
    const roleBasedDefaults = {
      Manager: { name: 'Roberto Manager', specialty: 'Team Management' },
      Mechanic: { name: 'Paulo Mechanic', specialty: 'General Repair' },
      Electrician: { name: 'Lucas Electrician', specialty: 'Auto Electrical' },
      Supervisor: { name: 'Sandra Supervisor', specialty: 'Quality Control' },
    }

    const roleDefaults = roleBasedDefaults[role as keyof typeof roleBasedDefaults] || {}

    return this.create({
      ...roleDefaults,
      ...overrides,
      role,
      email:
        overrides.email ?? `${roleDefaults.name?.toLowerCase().replace(' ', '.')}@workshop.com`,
    })
  }

  /**
   * Create an array of Employee entities
   * @param count - Number of employees to create
   * @param baseOverrides - Base overrides to apply to all employees
   * @returns Array of Employee entities
   */
  public static createMany(
    count: number,
    baseOverrides: Partial<{
      role: string
      phone?: string
      specialty?: string
      isActive: boolean
    }> = {},
  ): Employee[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...baseOverrides,
        id: `employee-test-${index}-${Date.now()}`,
        name: `${baseOverrides.role ?? 'Employee'} ${index + 1}`,
        email: `employee${index + 1}@workshop.com`,
      }),
    )
  }
}

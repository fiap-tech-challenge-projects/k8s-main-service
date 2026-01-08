import { UserRole } from '@prisma/client'

import { User } from '@domain/auth/entities'
import { Email } from '@shared'

/**
 * Factory for creating User entities for testing
 */
export class UserFactory {
  /**
   * Create a valid User entity with default values
   * @param overrides - Optional properties to override defaults
   * @returns User entity
   */
  public static create(
    overrides: Partial<{
      id: string
      email: string
      password: string
      role: UserRole
      isActive: boolean
      lastLoginAt: Date | null
      clientId: string | null
      employeeId: string | null
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): User {
    const defaults = {
      id: `user-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: 'test@example.com',
      password: 'hashedPassword123',
      role: UserRole.CLIENT,
      isActive: true,
      lastLoginAt: null,
      clientId: null,
      employeeId: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new User(
      data.id,
      Email.create(data.email),
      data.password,
      data.role,
      data.isActive,
      data.lastLoginAt,
      data.clientId,
      data.employeeId,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a User entity with CLIENT role
   * @param overrides - Optional properties to override defaults
   * @returns User entity
   */
  public static createClient(
    overrides: Partial<{
      id: string
      email: string
      password: string
      clientId: string
      isActive: boolean
      lastLoginAt: Date | null
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): User {
    const defaults = {
      id: `user-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: 'client@example.com',
      password: 'hashedPassword123',
      clientId: 'client-123',
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new User(
      data.id,
      Email.create(data.email),
      data.password,
      UserRole.CLIENT,
      data.isActive,
      data.lastLoginAt,
      data.clientId,
      null,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a User entity with EMPLOYEE role
   * @param overrides - Optional properties to override defaults
   * @returns User entity
   */
  public static createEmployee(
    overrides: Partial<{
      id: string
      email: string
      password: string
      employeeId: string
      isActive: boolean
      lastLoginAt: Date | null
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): User {
    const defaults = {
      id: `user-employee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: 'employee@example.com',
      password: 'hashedPassword123',
      employeeId: 'employee-123',
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new User(
      data.id,
      Email.create(data.email),
      data.password,
      UserRole.EMPLOYEE,
      data.isActive,
      data.lastLoginAt,
      null,
      data.employeeId,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a User entity with ADMIN role
   * @param overrides - Optional properties to override defaults
   * @returns User entity
   */
  public static createAdmin(
    overrides: Partial<{
      id: string
      email: string
      password: string
      isActive: boolean
      lastLoginAt: Date | null
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): User {
    const defaults = {
      id: `user-admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: 'admin@example.com',
      password: 'hashedPassword123',
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }

    const data = { ...defaults, ...overrides }

    return new User(
      data.id,
      Email.create(data.email),
      data.password,
      UserRole.ADMIN,
      data.isActive,
      data.lastLoginAt,
      null,
      null,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create multiple User entities
   * @param count - Number of users to create
   * @param overrides - Optional properties to override defaults
   * @returns Array of User entities
   */
  public static createMany(
    count: number,
    overrides: Partial<{
      id: string
      email: string
      password: string
      role: UserRole
      isActive: boolean
      lastLoginAt: Date | null
      clientId: string | null
      employeeId: string | null
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): User[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...overrides,
        id: overrides.id ?? `user-test-${index + 1}`,
        email: overrides.email ?? `user${index + 1}@example.com`,
      }),
    )
  }
}

import { Injectable } from '@nestjs/common'
import { Employee as PrismaEmployee } from '@prisma/client'

import { Employee } from '@domain/employees/entities'
import { IEmployeeRepository } from '@domain/employees/interfaces'
import { BasePrismaRepository } from '@infra/database/common'
import { EmployeeMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PaginatedResult } from '@shared'
import { Email } from '@shared/value-objects'

/**
 * Prisma implementation of the Employee repository
 */
@Injectable()
export class PrismaEmployeeRepository
  extends BasePrismaRepository<Employee, PrismaEmployee>
  implements IEmployeeRepository
{
  /**
   * Constructor for PrismaEmployeeRepository
   * @param prisma - The Prisma service dependency
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaEmployeeRepository.name)
  }

  protected get modelName(): string {
    return 'employee'
  }

  protected get mapper(): (prismaModel: PrismaEmployee) => Employee {
    return EmployeeMapper.toDomain
  }

  protected get createMapper(): (entity: Employee) => Record<string, unknown> {
    return EmployeeMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: Employee) => Record<string, unknown> {
    return EmployeeMapper.toPrismaUpdate
  }

  /**
   * Find employee by email
   * @param email - Employee's email address
   * @returns Promise resolving to the employee or null if not found
   */
  async findByEmail(email: string): Promise<Employee | null> {
    try {
      const normalizedEmail = new Email(email).normalized
      return this.findByUniqueField('email', normalizedEmail)
    } catch (error) {
      this.logger.error(`Error finding employee by email ${email}:`, error)
      throw error
    }
  }

  /**
   * Check if email exists
   * @param email - Email address to check
   * @returns Promise resolving to true if exists, false otherwise
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const normalizedEmail = new Email(email).normalized
      return this.uniqueFieldExists('email', normalizedEmail)
    } catch (error) {
      this.logger.error(`Error checking if email exists ${email}:`, error)
      throw error
    }
  }

  /**
   * Find employees by name with pagination
   * @param name - Name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByName(
    name: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Employee>> {
    return this.findPaginated(
      {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      page,
      limit,
      { createdAt: 'desc' },
    )
  }

  /**
   * Find employees by role with pagination
   * @param role - Role to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByRole(
    role: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Employee>> {
    return this.findPaginated(
      {
        role: {
          contains: role,
          mode: 'insensitive',
        },
      },
      page,
      limit,
      { createdAt: 'desc' },
    )
  }

  /**
   * Find active employees with pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findActive(page?: number, limit?: number): Promise<PaginatedResult<Employee>> {
    return this.findPaginated(
      {
        isActive: true,
      },
      page,
      limit,
      { createdAt: 'desc' },
    )
  }

  /**
   * Find inactive employees with pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findInactive(page?: number, limit?: number): Promise<PaginatedResult<Employee>> {
    return this.findPaginated(
      {
        isActive: false,
      },
      page,
      limit,
      { createdAt: 'desc' },
    )
  }
}

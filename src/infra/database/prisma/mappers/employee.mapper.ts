import { Employee as PrismaEmployee, Prisma } from '@prisma/client'

import { Employee } from '@domain/employees/entities'
import { Email } from '@shared'
import { validateBasePrismaMapper } from '@shared/bases'

type PrismaEmployeeCreateInput = Prisma.EmployeeUncheckedCreateInput
type PrismaEmployeeUpdateInput = Prisma.EmployeeUncheckedUpdateInput

/**
 * Mapper for converting between Employee entities and Prisma data
 */
export class EmployeeMapper {
  /**
   * Convert Prisma employee data to Employee entity
   * @param employeeData - Prisma employee data
   * @returns Employee entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  static toDomain(employeeData: PrismaEmployee): Employee {
    if (!employeeData) {
      throw new Error('Prisma Employee model cannot be null or undefined')
    }

    return new Employee(
      employeeData.id,
      employeeData.name,
      Email.create(employeeData.email),
      employeeData.role,
      employeeData.phone ?? undefined,
      employeeData.specialty ?? undefined,
      employeeData.isActive,
      employeeData.createdAt,
      employeeData.updatedAt,
    )
  }

  /**
   * Convert multiple Prisma Employee models to Employee domain entities
   * @param prismaEmployees - Array of Prisma Employee models
   * @returns Array of Employee domain entities
   */
  static toDomainMany(prismaEmployees: PrismaEmployee[]): Employee[] {
    if (!Array.isArray(prismaEmployees)) {
      return []
    }

    return prismaEmployees
      .filter((employee) => employee !== null && employee !== undefined)
      .map((employee) => this.toDomain(employee))
  }

  /**
   * Convert Employee entity to Prisma create data
   * @param employee - Employee entity
   * @returns Prisma create data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaCreate(employee: Employee): PrismaEmployeeCreateInput {
    if (!employee) {
      throw new Error('Employee domain entity cannot be null or undefined')
    }

    return {
      name: employee.name,
      email: employee.email.value,
      role: employee.role,
      phone: employee.phone ?? null,
      specialty: employee.specialty ?? null,
      isActive: employee.isActive,
    }
  }

  /**
   * Convert Employee entity to Prisma update data
   * @param employee - Employee entity
   * @returns Prisma update data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaUpdate(employee: Employee): PrismaEmployeeUpdateInput {
    if (!employee) {
      throw new Error('Employee domain entity cannot be null or undefined')
    }

    return {
      name: employee.name,
      email: employee.email.value,
      role: employee.role,
      phone: employee.phone ?? null,
      specialty: employee.specialty ?? null,
      isActive: employee.isActive,
      updatedAt: new Date(),
    }
  }
}

// Validate that this mapper implements the required contract
validateBasePrismaMapper<
  Employee,
  PrismaEmployee,
  PrismaEmployeeCreateInput,
  PrismaEmployeeUpdateInput
>(EmployeeMapper, 'EmployeeMapper')

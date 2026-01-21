import { EmployeeAlreadyExistsException } from '@domain/employees/exceptions'

/**
 * Type for employee existence validation function
 */
export type EmployeeExistsFunction = (email: string) => Promise<boolean>

/**
 * Validator for employee business rules
 */
export class EmployeeValidator {
  /**
   * Validates employee creation requirements
   * @param email - Employee email
   * @param name - Employee name
   * @param role - Employee role
   * @param employeeExists - Function to check if employee exists
   * @throws EmployeeAlreadyExistsException if employee with email already exists
   */
  public static async validateEmployeeCreation(
    email: string,
    name: string,
    role: string,
    employeeExists: EmployeeExistsFunction,
  ): Promise<void> {
    // Validate email uniqueness
    const exists = await employeeExists(email)
    if (exists) {
      throw new EmployeeAlreadyExistsException(email)
    }

    // Validate required fields
    if (!email?.trim()) {
      throw new Error('Employee email is required')
    }

    if (!name?.trim()) {
      throw new Error('Employee name is required')
    }

    if (!role?.trim()) {
      throw new Error('Employee role is required')
    }
  }

  /**
   * Validates employee email format and uniqueness
   * @param email - Employee email to validate
   * @param employeeExists - Function to check if employee exists
   * @throws EmployeeAlreadyExistsException if email already exists
   */
  public static async validateEmployeeEmail(
    email: string,
    employeeExists: EmployeeExistsFunction,
  ): Promise<void> {
    if (!email?.trim()) {
      throw new Error('Employee email is required')
    }

    const exists = await employeeExists(email)
    if (exists) {
      throw new EmployeeAlreadyExistsException(email)
    }
  }

  /**
   * Validates employee role
   * @param role - Employee role to validate
   */
  public static validateEmployeeRole(role: string): void {
    const validRoles = ['ADMIN', 'EMPLOYEE']

    if (!role?.trim()) {
      throw new Error('Employee role is required')
    }

    if (!validRoles.includes(role.toUpperCase())) {
      throw new Error(`Invalid employee role. Must be one of: ${validRoles.join(', ')}`)
    }
  }

  /**
   * Validates employee name
   * @param name - Employee name to validate
   */
  public static validateEmployeeName(name: string): void {
    if (!name?.trim()) {
      throw new Error('Employee name is required')
    }

    if (name.trim().length < 2) {
      throw new Error('Employee name must be at least 2 characters long')
    }

    if (name.trim().length > 100) {
      throw new Error('Employee name must be less than 100 characters long')
    }
  }
}

import { EmployeeAlreadyExistsException } from '@domain/employees/exceptions'

/**
 * Type for employee existence validation function
 */
export type EmployeeExistsFunction = (email: string) => Promise<boolean>

/**
 * Validator for employee creation business rules
 */
export class EmployeeCreationValidator {
  /**
   * Validates employee creation requirements
   * @param email - Employee email
   * @param name - Employee name
   * @param role - Employee role
   * @param password - Employee password
   * @param employeeExists - Function to check if employee exists
   * @throws EmployeeAlreadyExistsException if employee with email already exists
   */
  public static async validateEmployeeCreation(
    email: string,
    name: string,
    role: string,
    password: string,
    employeeExists: EmployeeExistsFunction,
  ): Promise<void> {
    // Validate required fields first
    this.validateRequiredFields(email, name, role, password)

    // Validate individual field formats
    this.validateEmailFormat(email)
    this.validateName(name)
    this.validateRole(role)
    this.validatePassword(password)

    // Validate email uniqueness
    const exists = await employeeExists(email)
    if (exists) {
      throw new EmployeeAlreadyExistsException(email)
    }
  }

  /**
   * Validates employee creation requirements without password
   * @param email - Employee email
   * @param name - Employee name
   * @param role - Employee role
   * @param employeeExists - Function to check if employee exists
   * @throws EmployeeAlreadyExistsException if employee with email already exists
   */
  public static async validateEmployeeCreationWithoutPassword(
    email: string,
    name: string,
    role: string,
    employeeExists: EmployeeExistsFunction,
  ): Promise<void> {
    // Validate required fields first (without password)
    this.validateRequiredFieldsWithoutPassword(email, name, role)

    // Validate individual field formats
    this.validateEmailFormat(email)
    this.validateName(name)
    this.validateRole(role)

    // Validate email uniqueness
    const exists = await employeeExists(email)
    if (exists) {
      throw new EmployeeAlreadyExistsException(email)
    }
  }

  /**
   * Validates required fields for employee creation
   * @param email - Employee email
   * @param name - Employee name
   * @param role - Employee role
   * @param password - Employee password
   */
  private static validateRequiredFields(
    email: string,
    name: string,
    role: string,
    password: string,
  ): void {
    if (!email?.trim()) {
      throw new Error('Employee email is required')
    }

    if (!name?.trim()) {
      throw new Error('Employee name is required')
    }

    if (!role?.trim()) {
      throw new Error('Employee role is required')
    }

    if (!password?.trim()) {
      throw new Error('Employee password is required')
    }
  }

  /**
   * Validates required fields for employee creation without password
   * @param email - Employee email
   * @param name - Employee name
   * @param role - Employee role
   */
  private static validateRequiredFieldsWithoutPassword(
    email: string,
    name: string,
    role: string,
  ): void {
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
   * Validates employee email format
   * @param email - Employee email to validate
   */
  private static validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new Error('Invalid email format')
    }
  }

  /**
   * Validates employee name
   * @param name - Employee name to validate
   */
  private static validateName(name: string): void {
    if (name.trim().length < 2) {
      throw new Error('Employee name must be at least 2 characters long')
    }

    if (name.trim().length > 100) {
      throw new Error('Employee name must be less than 100 characters long')
    }
  }

  /**
   * Validates employee role
   * @param role - Employee role to validate
   */
  private static validateRole(role: string): void {
    const validRoles = ['ADMIN', 'EMPLOYEE', 'MECHANIC', 'TECHNICIAN', 'MANAGER', 'SUPERVISOR']

    if (!validRoles.includes(role.toUpperCase())) {
      throw new Error(`Invalid employee role. Must be one of: ${validRoles.join(', ')}`)
    }
  }

  /**
   * Validates employee password strength
   * @param password - Employee password to validate
   */
  private static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Employee password must be at least 8 characters long')
    }

    if (password.length > 128) {
      throw new Error('Employee password must be less than 128 characters long')
    }

    // Basic password strength validation
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      throw new Error(
        'Employee password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      )
    }
  }
}

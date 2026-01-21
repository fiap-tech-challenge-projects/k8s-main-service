/**
 * Validator for employee update business rules
 */
export class EmployeeUpdateValidator {
  /**
   * Validates employee update requirements
   * @param name - Employee name (optional)
   * @param role - Employee role (optional)
   * @param password - Employee password (optional)
   */
  public static validateEmployeeUpdate(name?: string, role?: string, password?: string): void {
    // Validate name if provided
    if (name !== undefined) {
      this.validateName(name)
    }

    // Validate role if provided
    if (role !== undefined) {
      this.validateRole(role)
    }

    // Validate password if provided
    if (password !== undefined) {
      this.validatePassword(password)
    }
  }

  /**
   * Validates employee name
   * @param name - Employee name to validate
   */
  private static validateName(name: string): void {
    if (!name?.trim()) {
      throw new Error('Employee name cannot be empty')
    }

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
    const validRoles = ['ADMIN', 'EMPLOYEE']

    if (!role?.trim()) {
      throw new Error('Employee role cannot be empty')
    }

    if (!validRoles.includes(role.toUpperCase())) {
      throw new Error(`Invalid employee role. Must be one of: ${validRoles.join(', ')}`)
    }
  }

  /**
   * Validates employee password strength
   * @param password - Employee password to validate
   */
  private static validatePassword(password: string): void {
    if (!password?.trim()) {
      throw new Error('Employee password cannot be empty')
    }

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

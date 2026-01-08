import { DomainException } from '@shared'

/**
 * Exception thrown when trying to assign an invalid role to an employee
 */
export class EmployeeInvalidRoleException extends DomainException {
  /**
   * Constructor for EmployeeInvalidRoleException
   * @param role - The invalid role
   */
  constructor(role: string) {
    super(
      `Invalid role: ${role}. Role must be one of: ADMIN, EMPLOYEE`,
      'EmployeeInvalidRoleException',
    )
  }
}

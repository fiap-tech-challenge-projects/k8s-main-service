import { AlreadyExistsException } from '@shared'

/**
 * Exception thrown when trying to update an employee with an email that already exists for another employee
 */
export class EmployeeEmailAlreadyExistsException extends AlreadyExistsException {
  /**
   * Constructor for EmployeeEmailAlreadyExistsException
   * @param email - The email that already exists
   */
  constructor(email: string) {
    super('Employee', 'email', email)
    this.name = 'EmployeeEmailAlreadyExistsException'
  }
}

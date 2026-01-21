import { AlreadyExistsException } from '@shared'

/**
 * Employee already exists exception
 * Thrown when attempting to create an employee with an email that already exists
 */
export class EmployeeAlreadyExistsException extends AlreadyExistsException {
  /**
   * Constructor for Employee already exists exception
   * @param email - The email that already exists
   */
  constructor(email: string) {
    super('Employee', 'email', email)
    this.name = 'EmployeeAlreadyExistsException'
  }
}

import { EntityNotFoundException } from '@shared'

/**
 * Exception thrown when an employee is not found
 */
export class EmployeeNotFoundException extends EntityNotFoundException {
  /**
   * Constructor for EmployeeNotFoundException
   * @param id - Employee ID that was not found
   */
  constructor(id: string) {
    super('Employee', id)
    this.name = 'EmployeeNotFoundException'
  }
}

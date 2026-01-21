import { DomainException } from '@shared'

/**
 * Exception thrown when trying to perform operations on an inactive employee
 */
export class EmployeeInactiveException extends DomainException {
  /**
   * Constructor for EmployeeInactiveException
   * @param id - Employee ID that is inactive
   */
  constructor(id: string) {
    super(
      `Employee with ID ${id} is inactive and cannot perform operations`,
      'EmployeeInactiveException',
    )
  }
}

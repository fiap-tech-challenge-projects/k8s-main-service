import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when trying to perform operation without assigned mechanic
 */
export class MechanicNotAssignedException extends DomainException {
  /**
   * Creates a new MechanicNotAssignedException
   * @param message - The error message
   */
  constructor(message: string = 'Cannot perform operation without assigned mechanic') {
    super(message)
    this.name = 'MechanicNotAssignedException'
  }
}

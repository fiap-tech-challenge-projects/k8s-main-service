import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when a service name is invalid
 */
export class InvalidServiceNameException extends DomainException {
  /**
   * Creates a new InvalidServiceNameException
   * @param message - The error message describing the invalid service name
   */
  constructor(message: string = 'Invalid service name') {
    super(message)
    this.name = 'InvalidServiceNameException'
  }
}

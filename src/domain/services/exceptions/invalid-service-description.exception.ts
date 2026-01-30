import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when a service description is invalid
 */
export class InvalidServiceDescriptionException extends DomainException {
  /**
   * Creates a new InvalidServiceDescriptionException
   * @param message - The error message
   */
  constructor(message: string = 'Invalid service description') {
    super(message)
    this.name = 'InvalidServiceDescriptionException'
  }
}

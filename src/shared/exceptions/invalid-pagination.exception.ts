import { DomainException } from './domain-exception'

/**
 * Exception thrown when pagination parameters are invalid
 */
export class InvalidPaginationException extends DomainException {
  /**
   * Constructor for invalid pagination exception
   * @param message - Error message
   */
  constructor(message: string) {
    super(message, 'InvalidPaginationException')
  }
}

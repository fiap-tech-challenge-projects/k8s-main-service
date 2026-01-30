import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when email format is invalid
 */
export class InvalidEmailFormatException extends DomainException {
  /**
   * Constructor for InvalidEmailFormatException
   * @param email - The invalid email address
   */
  constructor(email: string) {
    super(`Invalid email format: ${email}`, 'INVALID_EMAIL_FORMAT')
  }
}

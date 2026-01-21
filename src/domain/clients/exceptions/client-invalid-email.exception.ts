import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when a client has an invalid email
 */
export class ClientInvalidEmailException extends DomainException {
  /**
   * Creates a ClientInvalidEmailException
   * @param email - The invalid email
   */
  constructor(email: string) {
    super(
      `Invalid email format: ${email}. Please provide a valid email address.`,
      'ClientInvalidEmailException',
    )
  }
}

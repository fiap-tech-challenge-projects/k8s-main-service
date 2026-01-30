import { AlreadyExistsException } from '@shared/exceptions'

/**
 * Exception thrown when a client email already exists
 */
export class ClientEmailAlreadyExistsException extends AlreadyExistsException {
  /**
   * Creates a ClientEmailAlreadyExistsException
   * @param email - The email that already exists
   */
  constructor(email: string) {
    super('client', 'email', email)
    this.name = 'ClientEmailAlreadyExistsException'
  }
}

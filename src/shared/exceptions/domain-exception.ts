/**
 * Base exception for domain-related errors
 */
export abstract class DomainException extends Error {
  /**
   * Constructor for domain exception
   * @param message - Error message
   * @param name - Exception name
   */
  constructor(message: string, name: string = 'DomainException') {
    super(message)
    this.name = name
  }
}

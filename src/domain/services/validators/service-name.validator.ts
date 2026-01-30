import { InvalidServiceNameException } from '@domain/services/exceptions'

/**
 * Domain validator for Service name field
 */
export class ServiceNameValidator {
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 100

  /**
   * Validates service name according to business rules
   * @param name - The service name to validate
   * @throws InvalidServiceNameException when validation fails
   */
  static validate(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new InvalidServiceNameException('Service name is required and must be a string')
    }

    const trimmedName = name.trim()

    if (trimmedName.length < this.MIN_LENGTH) {
      throw new InvalidServiceNameException(
        `Service name must be at least ${this.MIN_LENGTH} characters long`,
      )
    }

    if (trimmedName.length > this.MAX_LENGTH) {
      throw new InvalidServiceNameException(
        `Service name must not exceed ${this.MAX_LENGTH} characters`,
      )
    }

    if (!this.isValidFormat(trimmedName)) {
      throw new InvalidServiceNameException(
        'Service name contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed',
      )
    }
  }

  /**
   * Checks if name format is valid
   * @param name - The name to check
   * @returns true if format is valid
   */
  private static isValidFormat(name: string): boolean {
    const validPattern = /^[a-zA-ZÀ-ÿ0-9\s\-.,()]+$/
    return validPattern.test(name)
  }

  /**
   * Checks if a name is valid without throwing exceptions
   * @param name - The service name to validate
   * @returns true if valid, false otherwise
   */
  static isValid(name: string): boolean {
    try {
      this.validate(name)
      return true
    } catch (error) {
      console.error('Error validating service name:', error)
      return false
    }
  }
}

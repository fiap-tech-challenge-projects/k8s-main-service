import { InvalidServiceDescriptionException } from '@domain/services/exceptions'

/**
 * Domain validator for Service description field
 */
export class ServiceDescriptionValidator {
  private static readonly MIN_LENGTH = 5
  private static readonly MAX_LENGTH = 500

  /**
   * Validates service description according to business rules
   * @param description - The service description to validate
   * @throws InvalidServiceDescriptionException when validation fails
   */
  static validate(description: string): void {
    if (!description || typeof description !== 'string') {
      throw new InvalidServiceDescriptionException(
        'Service description is required and must be a string',
      )
    }

    const trimmedDescription = description.trim()

    if (trimmedDescription.length < this.MIN_LENGTH) {
      throw new InvalidServiceDescriptionException(
        `Service description must be at least ${this.MIN_LENGTH} characters long`,
      )
    }

    if (trimmedDescription.length > this.MAX_LENGTH) {
      throw new InvalidServiceDescriptionException(
        `Service description must not exceed ${this.MAX_LENGTH} characters`,
      )
    }
  }

  /**
   * Checks if a description is valid without throwing exceptions
   * @param description - The service description to validate
   * @returns true if valid, false otherwise
   */
  static isValid(description: string): boolean {
    try {
      this.validate(description)
      return true
    } catch (error) {
      console.error('Error validating service description:', error)
      return false
    }
  }
}

/**
 * Email format validation patterns
 */
export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  /**
   * Validates email format
   * @param email - Email string to validate
   * @returns True if email format is valid
   */
  public static isValidFormat(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false
    }

    return this.EMAIL_REGEX.test(email.trim())
  }

  /**
   * Validates email length constraints
   * @param email - Email string to validate
   * @returns True if email length is within acceptable limits
   */
  public static isValidLength(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false
    }

    const trimmedEmail = email.trim()
    return trimmedEmail.length >= 5 && trimmedEmail.length <= 254
  }

  /**
   * Validates domain part of email
   * @param email - Email string to validate
   * @returns True if domain part is valid
   */
  public static isValidDomain(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false
    }

    const parts = email.trim().split('@')
    if (parts.length !== 2) {
      return false
    }

    const domain = parts[1]
    return domain.length >= 3 && domain.includes('.')
  }

  /**
   * Comprehensive email validation
   * @param email - Email string to validate
   * @returns True if email is completely valid
   */
  public static isValid(email: string): boolean {
    return this.isValidFormat(email) && this.isValidLength(email) && this.isValidDomain(email)
  }
}

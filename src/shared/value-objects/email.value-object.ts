import { BaseValueObject } from '../bases'
import { InvalidValueException } from '../exceptions'

/**
 * Email value object
 */
export class Email extends BaseValueObject<string> {
  /**
   * Constructor for Email value object
   * @param value - The email string value
   */
  constructor(value: string) {
    super(value.trim())
  }

  /**
   * Validate the email value
   * @throws InvalidValueException if email is invalid
   */
  protected validate(): void {
    if (!this._value) {
      throw new InvalidValueException(String(this._value), 'Email must be a valid email address')
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(this._value) || this._value.length > 254) {
      throw new InvalidValueException(String(this._value), 'Email must be a valid email address')
    }
  }

  /**
   * Get the normalized email value (lowercase)
   * @returns Normalized email string
   */
  public get normalized(): string {
    return this._value.toLowerCase().trim()
  }

  /**
   * Get the domain part of the email
   * @returns Domain part of the email
   */
  public get domain(): string {
    return this._value.split('@')[1]
  }

  /**
   * Get the local part of the email (before @)
   * @returns Local part of the email
   */
  public get localPart(): string {
    return this._value.split('@')[0]
  }

  /**
   * Create an Email value object from a string
   * @param value - The email string value
   * @returns Email value object
   */
  public static create(value: string): Email {
    return new Email(value)
  }
}

import { BaseValueObject, InvalidValueException } from '@shared'

/**
 * CNPJ (Brazilian corporate taxpayer registration) value object
 */
export class Cnpj extends BaseValueObject<string> {
  /**
   * Constructor for CNPJ value object
   * @param value - The CNPJ string value
   */
  constructor(value: string) {
    super(value)
  }

  protected validate(): void {
    if (!Cnpj.isValid(this._value)) {
      throw new InvalidValueException(
        this._value,
        'CNPJ must be a valid Brazilian corporate taxpayer registration number',
      )
    }
  }

  /**
   * Get the formatted CNPJ value
   * @returns Formatted CNPJ string (XX.XXX.XXX/XXXX-XX)
   */
  public get formatted(): string {
    return Cnpj.format(this._value)
  }

  /**
   * Validate if a CNPJ string is valid according to Brazilian rules
   * @param cnpj - The CNPJ string to validate
   * @returns True if CNPJ is valid, false otherwise
   */
  public static isValid(cnpj: string): boolean {
    if (!cnpj || typeof cnpj !== 'string') {
      return false
    }

    const cleanCnpj = cnpj.replace(/\D/g, '')

    if (cleanCnpj.length !== 14) {
      return false
    }

    if (/^(\d)\1{13}$/.test(cleanCnpj)) {
      return false
    }

    let sum = 0
    let weight = 2

    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight
      weight = weight === 9 ? 2 : weight + 1
    }

    let remainder = sum % 11
    const firstDigit = remainder < 2 ? 0 : 11 - remainder

    if (parseInt(cleanCnpj.charAt(12)) !== firstDigit) {
      return false
    }

    sum = 0
    weight = 2

    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight
      weight = weight === 9 ? 2 : weight + 1
    }

    remainder = sum % 11
    const secondDigit = remainder < 2 ? 0 : 11 - remainder

    return parseInt(cleanCnpj.charAt(13)) === secondDigit
  }

  /**
   * Format a CNPJ string to the standard format (XX.XXX.XXX/XXXX-XX)
   * @param cnpj - The CNPJ string to format
   * @returns Formatted CNPJ string
   */
  public static format(cnpj: string): string {
    const cleanCnpj = cnpj.replace(/\D/g, '')
    return cleanCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  /**
   * Get the clean CNPJ value (numbers only)
   * @returns Clean CNPJ string with only numbers
   */
  public get clean(): string {
    return this._value.replace(/\D/g, '')
  }

  /**
   * Create a CNPJ value object from a string
   * @param value - The CNPJ string value
   * @returns CNPJ value object
   */
  public static create(value: string): Cnpj {
    return new Cnpj(value)
  }
}

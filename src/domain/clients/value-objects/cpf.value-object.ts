import { BaseValueObject, InvalidValueException } from '@shared'

/**
 * CPF (Brazilian individual taxpayer registration) value object
 */
export class Cpf extends BaseValueObject<string> {
  /**
   * Constructor for CPF value object
   * @param value - The CPF string value
   */
  constructor(value: string) {
    super(value)
  }

  /**
   * Validate the CPF value
   * @throws InvalidValueException if CPF is invalid
   */
  protected validate(): void {
    if (!Cpf.isValid(this._value)) {
      throw new InvalidValueException(
        this._value,
        'CPF must be a valid Brazilian individual taxpayer registration number',
      )
    }
  }

  /**
   * Get the formatted CPF value
   * @returns Formatted CPF string (XXX.XXX.XXX-XX)
   */
  public get formatted(): string {
    return Cpf.format(this._value)
  }

  /**
   * Get the clean CPF value (numbers only)
   * @returns Clean CPF string with only numbers
   */
  public get clean(): string {
    return this._value.replace(/\D/g, '')
  }

  /**
   * Create a new CPF value object
   * @param value - The CPF string value
   * @returns A new CPF value object
   */
  public static create(value: string): Cpf {
    return new Cpf(value)
  }

  /**
   * Validate if a CPF string is valid according to Brazilian rules
   * @param cpf - The CPF string to validate
   * @returns True if CPF is valid, false otherwise
   */
  public static isValid(cpf: string): boolean {
    if (!cpf || typeof cpf !== 'string') {
      return false
    }

    const cleanCpf = cpf.replace(/\D/g, '')

    if (cleanCpf.length !== 11) {
      return false
    }

    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return false
    }

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
    }

    let remainder = sum % 11
    const firstDigit = remainder < 2 ? 0 : 11 - remainder

    if (parseInt(cleanCpf.charAt(9)) !== firstDigit) {
      return false
    }

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
    }

    remainder = sum % 11
    const secondDigit = remainder < 2 ? 0 : 11 - remainder

    return parseInt(cleanCpf.charAt(10)) === secondDigit
  }

  /**
   * Format a CPF string to the standard format (XXX.XXX.XXX-XX)
   * @param cpf - The CPF string to format
   * @returns Formatted CPF string
   */
  public static format(cpf: string): string {
    const cleanCpf = cpf.replace(/\D/g, '')
    return cleanCpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  }
}

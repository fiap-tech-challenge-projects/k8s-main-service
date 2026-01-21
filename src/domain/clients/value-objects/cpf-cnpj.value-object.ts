import { BaseValueObject, InvalidValueException } from '@shared'

import { Cnpj } from './cnpj.value-object'
import { Cpf } from './cpf.value-object'

/**
 * CPF/CNPJ (Brazilian taxpayer registration) value object
 */
export class CpfCnpj extends BaseValueObject<string> {
  /**
   * Constructor for CPF/CNPJ value object
   * @param value - The CPF or CNPJ string value
   */
  constructor(value: string) {
    super(value)
  }

  protected validate(): void {
    const cleanValue = this._value.replace(/\D/g, '')

    if (cleanValue.length === 11) {
      if (!Cpf.isValid(this._value)) {
        throw new InvalidValueException(
          this._value,
          'CPF must be a valid Brazilian individual taxpayer registration number',
        )
      }
    } else if (cleanValue.length === 14) {
      if (!Cnpj.isValid(this._value)) {
        throw new InvalidValueException(
          this._value,
          'CNPJ must be a valid Brazilian corporate taxpayer registration number',
        )
      }
    } else {
      throw new InvalidValueException(
        this._value,
        'Value must be a valid Brazilian CPF (11 digits) or CNPJ (14 digits)',
      )
    }
  }

  /**
   * Check if the value is a CPF
   * @returns True if the value is a CPF, false otherwise
   */
  public get isCpf(): boolean {
    return this._value.replace(/\D/g, '').length === 11
  }

  /**
   * Check if the value is a CNPJ
   * @returns True if the value is a CNPJ, false otherwise
   */
  public get isCnpj(): boolean {
    return this._value.replace(/\D/g, '').length === 14
  }

  /**
   * Get the formatted CPF or CNPJ value
   * @returns Formatted CPF or CNPJ string
   */
  public get formatted(): string {
    const cleanValue = this._value.replace(/\D/g, '')

    if (cleanValue.length === 11) {
      return Cpf.format(this._value)
    } else {
      return Cnpj.format(this._value)
    }
  }

  /**
   * Get the clean CPF or CNPJ value (numbers only)
   * @returns Clean CPF or CNPJ string with only numbers
   */
  public get clean(): string {
    return this._value.replace(/\D/g, '')
  }

  /**
   * Create a CPF/CNPJ value object from a string
   * @param value - The CPF or CNPJ string value
   * @returns CPF/CNPJ value object
   */
  public static create(value: string): CpfCnpj {
    return new CpfCnpj(value)
  }

  /**
   * Validate if a string is a valid CPF or CNPJ
   * @param value - The string to validate
   * @returns True if the string is a valid CPF or CNPJ, false otherwise
   */
  public static isValid(value: string): boolean {
    const cleanValue = value.replace(/\D/g, '')

    if (cleanValue.length === 11) {
      return Cpf.isValid(value)
    } else if (cleanValue.length === 14) {
      return Cnpj.isValid(value)
    }

    return false
  }

  /**
   * Format a CPF/CNPJ string
   * @param value - The string to format
   * @returns Formatted CPF or CNPJ string
   */
  public static format(value: string): string {
    const cleanValue = value.replace(/\D/g, '')

    if (cleanValue.length === 11) {
      return Cpf.format(value)
    } else if (cleanValue.length === 14) {
      return Cnpj.format(value)
    }

    return value
  }
}

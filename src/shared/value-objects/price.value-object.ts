import { BaseValueObject } from '@shared/bases'

import { InvalidPriceException } from '../exceptions'
import { PriceValidator } from '../validators'

/**
 * Value object representing a price in cents.
 */
export class Price extends BaseValueObject<number> {
  private constructor(value: string | number) {
    // Convert input to cents for internal storage
    const centsValue = typeof value === 'string' ? PriceValidator.formatToNumber(value) : value
    super(centsValue)
  }

  protected validate(): void {
    if (!Number.isInteger(this._value) || this._value < 0) {
      throw new InvalidPriceException(this._value / 100) // Show reais value in error
    }
  }

  /**
   * Factory method to create a Price value object from a string or number.
   * @param value - The price value as a string or number (in reais or cents)
   * @returns A new Price instance
   */
  static create(value: string | number): Price {
    // Validate input before creating the instance
    if (!PriceValidator.isValid(value)) {
      throw new InvalidPriceException(value)
    }

    return new Price(value)
  }

  /**
   * Get the price value in cents.
   * @returns Price value in cents
   */
  public getValue(): number {
    return this._value
  }

  /**
   * Get the price value in reais.
   * @returns Price value in reais
   */
  public getReaisValue(): number {
    return this._value / 100
  }

  /**
   * Get the price formatted as a string in Brazilian Real currency format.
   * @returns Formatted price string
   */
  public getFormatted(): string {
    return this.getReaisValue().toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }
}

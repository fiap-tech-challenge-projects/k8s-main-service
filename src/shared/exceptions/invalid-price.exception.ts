import { DomainException } from './domain-exception'

/**
 * Exception thrown when a price value is invalid
 */
export class InvalidPriceException extends DomainException {
  /**
   * Constructor for invalid price exception
   * @param value - The invalid price value
   */
  constructor(value: string | number) {
    super(
      `Invalid price: "${value}". Expected format: "R$1000.00", "100000", "1000.00", "1000,00", "R$1.000,00", or "R$1,000.00"`,
    )
    this.name = 'InvalidPriceException'
  }
}

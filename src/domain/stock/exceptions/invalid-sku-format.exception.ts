import { InvalidValueException } from '@shared'

/**
 * Invalid SKU format exception
 * Thrown when attempting to create or update a stock item with an invalid SKU format
 */
export class InvalidSkuFormatException extends InvalidValueException {
  /**
   * Constructor for invalid SKU format exception
   * @param sku - The invalid SKU that was provided
   */
  constructor(sku: string) {
    super(sku, 'must be alphanumeric with optional hyphens, 3-20 characters')
    this.name = 'InvalidSkuFormatException'
  }
}

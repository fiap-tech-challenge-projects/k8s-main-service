import { DomainException } from '@shared'

/**
 * Invalid price margin exception
 * Thrown when attempting to set a sale price lower than the cost price
 */
export class InvalidPriceMarginException extends DomainException {
  /**
   * Constructor for invalid price margin exception
   * @param unitCost - The unit cost
   * @param unitSalePrice - The unit sale price that is invalid
   */
  constructor(unitCost: number, unitSalePrice: number) {
    super(
      `Invalid price margin: sale price ${unitSalePrice} must be greater than or equal to cost ${unitCost}`,
    )
    this.name = 'InvalidPriceMarginException'
  }
}

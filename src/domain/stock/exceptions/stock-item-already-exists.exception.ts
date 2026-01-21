import { AlreadyExistsException } from '@shared'

/**
 * StockItem already exists exception
 * Thrown when attempting to create a stock item with a SKU that already exists
 */
export class StockItemAlreadyExistsException extends AlreadyExistsException {
  /**
   * Constructor for StockItem already exists exception
   * @param sku - The SKU that already exists
   */
  constructor(sku: string) {
    super('Stock item', 'SKU', sku)
    this.name = 'StockItemAlreadyExistsException'
  }
}

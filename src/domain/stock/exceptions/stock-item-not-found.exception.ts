import { EntityNotFoundException } from '@shared'

/**
 * StockItem not found exception
 */
export class StockItemNotFoundException extends EntityNotFoundException {
  /**
   * Constructor for StockItem not found exception
   * @param stockItemId - Stock item's unique identifier
   */
  constructor(stockItemId: string) {
    super('StockItem', stockItemId)
    this.name = 'StockItemNotFoundException'
  }
}

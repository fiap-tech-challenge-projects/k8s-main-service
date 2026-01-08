import { EntityNotFoundException } from '@shared'

/**
 * StockMovement not found exception
 */
export class StockMovementNotFoundException extends EntityNotFoundException {
  /**
   * Constructor for StockMovement not found exception
   * @param stockMovementId - Stock movement's unique identifier
   */
  constructor(stockMovementId: string) {
    super('StockMovement', stockMovementId)
    this.name = 'StockMovementNotFoundException'
  }
}

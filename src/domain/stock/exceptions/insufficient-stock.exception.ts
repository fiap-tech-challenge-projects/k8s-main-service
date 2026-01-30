import { DomainException } from '@shared'

/**
 * Insufficient stock exception
 * Thrown when attempting to perform a stock movement that would result in negative stock
 */
export class InsufficientStockException extends DomainException {
  /**
   * Constructor for insufficient stock exception
   * @param currentStock - The current stock level
   * @param requestedQuantity - The quantity that was requested
   * @param stockItemId - The stock item identifier (optional)
   */
  constructor(currentStock: number, requestedQuantity: number, stockItemId?: string) {
    const message = stockItemId
      ? `Insufficient stock for item ${stockItemId}. Current: ${currentStock}, Requested: ${requestedQuantity}`
      : `Insufficient stock. Current: ${currentStock}, Requested: ${requestedQuantity}`

    super(message)
    this.name = 'InsufficientStockException'
  }
}

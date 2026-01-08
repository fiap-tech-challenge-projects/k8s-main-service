import { EntityNotFoundException } from '@shared/exceptions'

/**
 * Exception thrown when a budget cannot be approved due to insufficient stock.
 */
export class BudgetInsufficientStockException extends EntityNotFoundException {
  /**
   * Creates a BudgetInsufficientStockException.
   * @param budgetId - The ID of the budget.
   * @param stockItemId - The ID of the stock item with insufficient quantity.
   * @param requiredQuantity - The required quantity.
   * @param availableQuantity - The available quantity.
   */
  constructor(
    budgetId: string,
    stockItemId: string,
    requiredQuantity: number,
    availableQuantity: number,
  ) {
    super('Budget', budgetId)
    this.name = 'BudgetInsufficientStockException'
    this.message = `Budget ${budgetId} cannot be approved. Insufficient stock for item ${stockItemId}. Required: ${requiredQuantity}, Available: ${availableQuantity}`
  }
}

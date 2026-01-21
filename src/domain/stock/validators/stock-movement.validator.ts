import { StockMovementType } from '@prisma/client'

/**
 * Validator for stock movement business rules
 */
export class StockMovementValidator {
  /**
   * Validates if a stock movement type is valid
   * @param type - The movement type to validate
   * @returns True if type is valid, false otherwise
   */
  public static isValidMovementType(type: StockMovementType): boolean {
    return Object.values(StockMovementType).includes(type)
  }

  /**
   * Validates if quantity is valid for stock movement
   * @param quantity - The quantity to validate
   * @returns True if quantity is valid, false otherwise
   */
  public static isValidQuantity(quantity: number): boolean {
    return quantity > 0 && Number.isInteger(quantity)
  }

  /**
   * Validates if movement date is valid
   * @param movementDate - The movement date to validate
   * @returns True if date is valid, false otherwise
   */
  public static isValidMovementDate(movementDate: Date): boolean {
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const oneDayFuture = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    return movementDate >= oneYearAgo && movementDate <= oneDayFuture
  }

  /**
   * Validates if reason is valid
   * @param reason - The reason to validate
   * @returns True if reason is valid, false otherwise
   */
  public static isValidReason(reason?: string): boolean {
    if (!reason) return true
    return reason.trim().length <= 200
  }

  /**
   * Validates if notes are valid
   * @param notes - The notes to validate
   * @returns True if notes are valid, false otherwise
   */
  public static isValidNotes(notes?: string): boolean {
    if (!notes) return true
    return notes.trim().length <= 500
  }

  /**
   * Validates if stock ID is valid
   * @param stockId - The stock ID to validate
   * @returns True if stock ID is valid, false otherwise
   */
  public static isValidStockId(stockId: string): boolean {
    return Boolean(stockId && stockId.trim().length > 0)
  }

  /**
   * Validates if OUT movement can be performed with current stock
   * @param currentStock - The current stock level
   * @param outQuantity - The quantity to move out
   * @returns True if movement can be performed, false otherwise
   */
  public static canPerformOutMovement(currentStock: number, outQuantity: number): boolean {
    return currentStock >= outQuantity
  }

  /**
   * Validates if an adjustment movement quantity is reasonable
   * @param currentStock - The current stock level
   * @param adjustmentQuantity - The adjustment quantity (can be negative)
   * @returns True if adjustment is reasonable, false otherwise
   */
  public static isValidAdjustmentMovement(
    currentStock: number,
    adjustmentQuantity: number,
  ): boolean {
    const resultingStock = currentStock + adjustmentQuantity
    return resultingStock >= 0
  }

  /**
   * Validates all stock movement data
   * @param data - Object containing all stock movement data to validate
   * @param data.type - Movement type
   * @param data.quantity - Movement quantity
   * @param data.movementDate - Movement date
   * @param data.stockId - Stock item ID
   * @param data.reason - Optional reason
   * @param data.notes - Optional notes
   * @param data.currentStock - Current stock level (for validation)
   * @throws Error if any validation fails
   */
  public static validateStockMovementData(data: {
    type: StockMovementType
    quantity: number
    movementDate: Date
    stockId: string
    reason?: string
    notes?: string
    currentStock: number
  }): void {
    if (!this.isValidMovementType(data.type)) {
      throw new Error('Invalid movement type')
    }

    if (!this.isValidQuantity(data.quantity)) {
      throw new Error('Invalid quantity: must be a positive integer')
    }

    if (!this.isValidMovementDate(data.movementDate)) {
      throw new Error('Invalid movement date: must be within reasonable range')
    }

    if (!this.isValidStockId(data.stockId)) {
      throw new Error('Invalid stock ID: cannot be empty')
    }

    if (!this.isValidReason(data.reason)) {
      throw new Error('Invalid reason: must not exceed 200 characters')
    }

    if (!this.isValidNotes(data.notes)) {
      throw new Error('Invalid notes: must not exceed 500 characters')
    }

    // Business rule validations based on movement type
    if (data.type === StockMovementType.OUT) {
      if (!this.canPerformOutMovement(data.currentStock, data.quantity)) {
        throw new Error('Insufficient stock for OUT movement')
      }
    }

    if (data.type === StockMovementType.ADJUSTMENT) {
      const adjustmentQuantity = data.quantity - data.currentStock
      if (!this.isValidAdjustmentMovement(data.currentStock, adjustmentQuantity)) {
        throw new Error('Invalid adjustment: would result in negative stock')
      }
    }
  }
}

import { StockMovementType } from '@prisma/client'

/**
 * Response DTO for stock movement operations
 */
export class StockMovementResponseDto {
  /**
   * Unique identifier
   * @example "movement-123"
   */
  id: string

  /**
   * Type of stock movement
   * @example "IN"
   */
  type: StockMovementType

  /**
   * Quantity moved
   * @example 10
   */
  quantity: number

  /**
   * Date when movement occurred
   * @example "2025-08-13T10:30:00.000Z"
   */
  movementDate: Date

  /**
   * Stock item ID
   * @example "stock-item-123"
   */
  stockId: string

  /**
   * Reason for the movement
   * @example "Purchase order received"
   */
  reason?: string

  /**
   * Additional notes
   * @example "Items received from supplier XYZ"
   */
  notes?: string

  /**
   * Creation timestamp
   * @example "2025-08-13T10:30:00.000Z"
   */
  createdAt: Date

  /**
   * Last update timestamp
   * @example "2025-08-13T10:30:00.000Z"
   */
  updatedAt: Date
}

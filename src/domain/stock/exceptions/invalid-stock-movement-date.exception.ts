import { DomainException } from '@shared'

/**
 * Invalid stock movement date exception
 * Thrown when attempting to create a stock movement with an invalid date
 */
export class InvalidStockMovementDateException extends DomainException {
  /**
   * Constructor for invalid stock movement date exception
   * @param movementDate - The invalid movement date
   */
  constructor(movementDate: Date) {
    super(
      `Invalid movement date: ${movementDate.toISOString()} must be within reasonable range (not older than 1 year, not more than 1 day in the future)`,
    )
    this.name = 'InvalidStockMovementDateException'
  }
}

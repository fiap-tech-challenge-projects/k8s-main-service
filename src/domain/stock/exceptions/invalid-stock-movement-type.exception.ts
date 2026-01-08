import { InvalidValueException } from '@shared'

/**
 * Invalid stock movement type exception
 * Thrown when attempting to perform a stock movement with an invalid type
 */
export class InvalidStockMovementTypeException extends InvalidValueException {
  /**
   * Constructor for invalid stock movement type exception
   * @param invalidType - The invalid stock movement type that was provided
   */
  constructor(invalidType: string) {
    super(invalidType, 'must be IN, OUT, or ADJUSTMENT')
    this.name = 'InvalidStockMovementTypeException'
  }
}

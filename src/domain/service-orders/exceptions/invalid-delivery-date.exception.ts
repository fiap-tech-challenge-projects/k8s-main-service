import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when delivery date is invalid
 */
export class InvalidDeliveryDateException extends DomainException {
  /**
   * Creates a new InvalidDeliveryDateException
   * @param deliveryDate - The invalid delivery date
   * @param requestDate - The request date to compare against
   */
  constructor(deliveryDate: Date, requestDate: Date) {
    super(
      `Delivery date ${deliveryDate.toISOString()} cannot be earlier than request date ${requestDate.toISOString()}`,
    )
    this.name = 'InvalidDeliveryDateException'
  }
}

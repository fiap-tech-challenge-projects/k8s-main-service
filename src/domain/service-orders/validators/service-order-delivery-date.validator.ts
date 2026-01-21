import { InvalidDeliveryDateException } from '@domain/service-orders/exceptions'

/**
 * Validator for service order delivery date business rules
 */
export class ServiceOrderDeliveryDateValidator {
  /**
   * Validates if a delivery date is valid for a service order
   * @param deliveryDate - The proposed delivery date
   * @param requestDate - The service order request date
   * @returns True if the delivery date is valid, false otherwise
   */
  public static isValidDeliveryDate(deliveryDate: Date, requestDate: Date): boolean {
    return deliveryDate >= requestDate
  }

  /**
   * Validates if a delivery date is valid and throws an error if not
   * @param deliveryDate - The proposed delivery date
   * @param requestDate - The service order request date
   * @throws InvalidDeliveryDateException if the delivery date is invalid
   */
  public static validateDeliveryDate(deliveryDate: Date, requestDate: Date): void {
    if (!this.isValidDeliveryDate(deliveryDate, requestDate)) {
      throw new InvalidDeliveryDateException(deliveryDate, requestDate)
    }
  }
}

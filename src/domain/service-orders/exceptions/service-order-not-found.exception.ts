import { EntityNotFoundException } from '@shared'

/**
 * Exception thrown when a service order is not found
 */
export class ServiceOrderNotFoundException extends EntityNotFoundException {
  /**
   * Constructor for service order not found exception
   * @param serviceOrderId - ID of the service order that was not found
   */
  constructor(serviceOrderId: string) {
    super('ServiceOrder', serviceOrderId)
    this.name = 'ServiceOrderNotFoundException'
  }
}

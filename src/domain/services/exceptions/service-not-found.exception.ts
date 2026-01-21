import { EntityNotFoundException } from '@shared'

/**
 * Exception thrown when a service is not found
 */
export class ServiceNotFoundException extends EntityNotFoundException {
  /**
   * Constructor for service not found exception
   * @param serviceId - ID of the service that was not found
   */
  constructor(serviceId: string) {
    super('Service', serviceId)
    this.name = 'ServiceNotFoundException'
  }
}

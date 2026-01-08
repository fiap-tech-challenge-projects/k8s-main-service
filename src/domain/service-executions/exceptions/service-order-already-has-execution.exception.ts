import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when a service order already has a service execution
 */
export class ServiceOrderAlreadyHasExecutionException extends DomainException {
  /**
   * Creates a new ServiceOrderAlreadyHasExecutionException
   * @param serviceOrderId - The service order ID that already has an execution
   */
  constructor(serviceOrderId: string) {
    super(`Service order ${serviceOrderId} already has a service execution`)
    this.name = 'ServiceOrderAlreadyHasExecutionException'
  }
}

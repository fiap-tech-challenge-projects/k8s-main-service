import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when a budget item cannot be created due to invalid service order status.
 */
export class InvalidServiceOrderStatusForBudgetItemException extends DomainException {
  /**
   * Creates an InvalidServiceOrderStatusForBudgetItemException.
   * @param serviceOrderId - The ID of the service order.
   * @param currentStatus - The current status of the service order.
   */
  constructor(serviceOrderId: string, currentStatus: string) {
    super(
      `Cannot add budget items to service order ${serviceOrderId}. Service order must be in IN_DIAGNOSIS status. Current status: ${currentStatus}`,
      'InvalidServiceOrderStatusForBudgetItemException',
    )
  }
}

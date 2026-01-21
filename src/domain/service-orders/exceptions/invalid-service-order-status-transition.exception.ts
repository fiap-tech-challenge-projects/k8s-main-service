import { ServiceOrderStatus } from '@prisma/client'

import { DomainException } from '@shared'

/**
 * Exception thrown when an invalid service order status transition is attempted
 */
export class InvalidServiceOrderStatusTransitionException extends DomainException {
  /**
   * Constructor for invalid service order status transition exception
   * @param currentStatus - Current status of the service order
   * @param newStatus - Attempted new status
   * @param allowedStatuses - List of allowed statuses from current status
   */
  constructor(
    currentStatus: ServiceOrderStatus,
    newStatus: ServiceOrderStatus,
    allowedStatuses: ServiceOrderStatus[],
  ) {
    const message = `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedStatuses.join(', ')}`
    super(message, 'InvalidServiceOrderStatusTransitionException')
  }
}

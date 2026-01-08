import { ServiceExecutionStatus } from '../enums'

/**
 * Exception thrown when a service execution status transition is invalid
 */
export class InvalidStatusTransitionException extends Error {
  /**
   * Creates a new InvalidStatusTransitionException
   * @param currentStatus - The current status
   * @param newStatus - The attempted new status
   * @param allowedStatuses - The allowed statuses for transition
   */
  constructor(
    currentStatus: ServiceExecutionStatus,
    newStatus: ServiceExecutionStatus,
    allowedStatuses: ServiceExecutionStatus[],
  ) {
    super(
      `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedStatuses.join(', ')}`,
    )
    this.name = 'InvalidStatusTransitionException'
  }
}

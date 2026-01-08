import { ServiceExecutionStatus } from '../enums'
import { InvalidStatusTransitionException } from '../exceptions'

/**
 * Domain validator for ServiceExecution status transitions
 */
export class ServiceExecutionStatusValidator {
  private static readonly ALLOWED_TRANSITIONS: Record<
    ServiceExecutionStatus,
    ServiceExecutionStatus[]
  > = {
    [ServiceExecutionStatus.ASSIGNED]: [ServiceExecutionStatus.IN_PROGRESS],
    [ServiceExecutionStatus.IN_PROGRESS]: [ServiceExecutionStatus.COMPLETED],
    [ServiceExecutionStatus.COMPLETED]: [],
  }

  /**
   * Validates if a status transition is allowed
   * @param currentStatus - The current status
   * @param newStatus - The new status to transition to
   * @throws InvalidStatusTransitionException when transition is not allowed
   */
  static validateTransition(
    currentStatus: ServiceExecutionStatus,
    newStatus: ServiceExecutionStatus,
  ): void {
    const allowedStatuses = this.ALLOWED_TRANSITIONS[currentStatus]

    if (!allowedStatuses.includes(newStatus)) {
      throw new InvalidStatusTransitionException(currentStatus, newStatus, allowedStatuses)
    }
  }

  /**
   * Checks if a status transition is valid without throwing exceptions
   * @param currentStatus - The current status
   * @param newStatus - The new status to transition to
   * @returns true if transition is valid, false otherwise
   */
  static isValidTransition(
    currentStatus: ServiceExecutionStatus,
    newStatus: ServiceExecutionStatus,
  ): boolean {
    try {
      this.validateTransition(currentStatus, newStatus)
      return true
    } catch (error) {
      console.error('Error validating status transition:', error)
      return false
    }
  }

  /**
   * Gets all allowed statuses for transition from current status
   * @param currentStatus - The current status
   * @returns Array of allowed statuses for transition
   */
  static getAllowedTransitions(currentStatus: ServiceExecutionStatus): ServiceExecutionStatus[] {
    return this.ALLOWED_TRANSITIONS[currentStatus]
  }
}

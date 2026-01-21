import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when a budget status transition is invalid.
 */
export class InvalidBudgetStatusException extends DomainException {
  /**
   * Creates an InvalidBudgetStatusException.
   * @param budgetId - The ID of the budget.
   * @param currentStatus - The current status of the budget.
   * @param attemptedStatus - The invalid status attempted.
   */
  constructor(budgetId: string, currentStatus: string, attemptedStatus: string) {
    super(
      `Budget with id ${budgetId} cannot transition from status "${currentStatus}" to "${attemptedStatus}".`,
      'InvalidBudgetStatusException',
    )
  }
}

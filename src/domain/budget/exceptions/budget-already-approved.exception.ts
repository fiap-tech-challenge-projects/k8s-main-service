import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when trying to approve a budget that is already approved.
 */
export class BudgetAlreadyApprovedException extends DomainException {
  /**
   * Creates a BudgetAlreadyApprovedException.
   * @param budgetId The unique identifier of the budget.
   */
  constructor(budgetId: string) {
    super(`Budget with id ${budgetId} is already approved.`, 'BudgetAlreadyApprovedException')
  }
}

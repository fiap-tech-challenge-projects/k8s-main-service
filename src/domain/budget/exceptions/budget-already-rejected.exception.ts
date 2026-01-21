import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when trying to reject a budget that is already rejected.
 */
export class BudgetAlreadyRejectedException extends DomainException {
  /**
   * Creates a BudgetAlreadyRejectedException.
   * @param budgetId The unique identifier of the budget.
   */
  constructor(budgetId: string) {
    super(`Budget with id ${budgetId} is already rejected.`, 'BudgetAlreadyRejectedException')
  }
}

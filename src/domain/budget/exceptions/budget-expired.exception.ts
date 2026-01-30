import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when trying to perform an operation on an expired budget.
 */
export class BudgetExpiredException extends DomainException {
  /**
   * Creates a BudgetExpiredException.
   * @param budgetId The unique identifier of the budget.
   * @param expirationDate The date when the budget expired.
   */
  constructor(budgetId: string, expirationDate: Date) {
    super(
      `Budget with id ${budgetId} has expired on ${expirationDate.toISOString()}.`,
      'BudgetExpiredException',
    )
  }
}

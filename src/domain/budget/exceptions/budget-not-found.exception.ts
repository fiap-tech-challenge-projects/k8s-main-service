import { EntityNotFoundException } from '@shared/exceptions'

/**
 * Exception thrown when a budget is not found
 */
export class BudgetNotFoundException extends EntityNotFoundException {
  /**
   * Constructor for budget not found exception
   * @param budgetId - ID of the budget that was not found
   */
  constructor(budgetId: string) {
    super('Budget', budgetId)
    this.name = 'BudgetNotFoundException'
  }
}

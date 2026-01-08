import { EntityNotFoundException } from '@shared/exceptions'

/**
 * Exception thrown when a BudgetItem is not found
 */
export class BudgetItemNotFoundException extends EntityNotFoundException {
  /**
   *
   * Creates an instance of BudgetItemNotFoundException.
   * This exception is thrown when a budget item with the specified ID is not found.
   * @param id - The ID of the budget item that was not found.
   */
  constructor(id: string) {
    super('budgetItem', `Budget item with ID ${id} not found.`)
    this.name = 'BudgetItemNotFoundException'
  }
}

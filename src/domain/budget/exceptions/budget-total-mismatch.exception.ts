import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when the calculated total of budget items does not match the declared total.
 */
export class BudgetTotalMismatchException extends DomainException {
  /**
   * Creates a BudgetTotalMismatchException.
   * @param budgetId - The ID of the budget with the mismatch.
   * @param declaredTotal - The declared total amount.
   * @param calculatedTotal - The calculated total amount.
   */
  constructor(budgetId: string, declaredTotal: number, calculatedTotal: number) {
    super(
      `Budget with id ${budgetId} has a total mismatch: declared ${declaredTotal} but calculated ${calculatedTotal}.`,
      'BudgetTotalMismatchException',
    )
  }
}

import { BudgetItem } from '@domain/budget-items/entities'
import { IBaseRepository, PaginatedResult } from '@shared/bases'

/**
 * Interface for BudgetItem Repository
 * Defines the contract for budget item data operations
 */
export const BUDGET_ITEM_REPOSITORY = Symbol('BUDGET_ITEM_REPOSITORY')

/*
 * Repository interface for BudgetItem domain operations
 * Extends base repository with budget item-specific query methods
 */
export interface IBudgetItemRepository extends IBaseRepository<BudgetItem> {
  /**
   * Find budget items by budget ID
   * @param budgetId - The unique identifier of the budget
   * @return Promise resolving to an array of budget items
   */
  findByBudgetId(budgetId: string): Promise<BudgetItem[]>

  /**
   * Find budget items by budget ID with pagination
   * @param budgetId - The unique identifier of the budget
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @return Promise resolving to paginated budget items
   */
  findByBudgetIdPaginated(
    budgetId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<BudgetItem>>
}

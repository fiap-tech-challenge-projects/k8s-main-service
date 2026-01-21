import { BudgetStatus } from '@prisma/client'

import { Budget } from '@domain/budget/entities'
import { IBaseRepository, PaginatedResult } from '@shared'

import { BudgetWithItems } from './budget-with-items.interface'

export const BUDGET_REPOSITORY = Symbol('BUDGET_REPOSITORY')

export interface IBudgetRepository extends IBaseRepository<Budget> {
  /**
   * Find budget by service order ID
   * @param serviceOrderId - Service order's unique identifier
   * @returns Promise resolving to the budget or null if not found
   */
  findByServiceOrderId(serviceOrderId: string): Promise<Budget | null>

  /**
   * Find budgets by client ID with pagination
   * @param clientId - Client's unique identifier
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findByClientId(clientId: string, page?: number, limit?: number): Promise<PaginatedResult<Budget>>

  /**
   * Find budgets by status with pagination
   * @param status - The status of the budgets to filter by
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findByStatus(
    status: BudgetStatus,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Budget>>

  /**
   * Find budgets by client name with pagination
   * @param clientName - Client's name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findByClientName(
    clientName: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Budget>>

  /**
   * Check if a budget exists for a service order
   * @param serviceOrderId - Service order's unique identifier
   * @returns Promise resolving to true if exists, false otherwise
   */
  budgetExistsForServiceOrder(serviceOrderId: string): Promise<boolean>

  /**
   * Check if a budget exists for a client
   * @param clientId - Client's unique identifier
   * @returns Promise resolving to true if exists, false otherwise
   */
  budgetExistsForClient(clientId: string): Promise<boolean>

  /**
   * Find budget by ID, including its items
   * @param id - Budget's unique identifier
   * @returns Promise resolving to the budget with items or null if not found
   */
  findByIdWithItems(id: string): Promise<BudgetWithItems | null>
}

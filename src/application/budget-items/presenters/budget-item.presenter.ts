import {
  BudgetItemResponseDto,
  PaginatedBudgetItemsResponseDto,
} from '@application/budget-items/dto'
import { BasePresenter } from '@shared/bases'

/**
 * HTTP response format for BudgetItem data
 */
export interface BudgetItemHttpResponse {
  id: string
  type: string
  description: string
  quantity: number
  unitPrice: string
  totalPrice: string
  budgetId: string
  notes?: string
  stockItemId?: string
  serviceId?: string
  createdAt: string
  updatedAt: string
}

/**
 * HTTP response format for paginated BudgetItems
 */
export interface PaginatedBudgetItemsHttpResponse {
  data: BudgetItemHttpResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Presenter for BudgetItem data formatting
 * Handles transformation of business data to HTTP response format
 */
export class BudgetItemPresenter extends BasePresenter<
  BudgetItemResponseDto,
  BudgetItemHttpResponse
> {
  /**
   * Format BudgetItem data for HTTP response
   * @param budgetItem - BudgetItem response DTO from application layer
   * @returns Formatted BudgetItem data for HTTP transport
   */
  present(budgetItem: BudgetItemResponseDto): BudgetItemHttpResponse {
    return {
      id: budgetItem.id,
      type: budgetItem.type,
      description: budgetItem.description,
      quantity: budgetItem.quantity,
      unitPrice: budgetItem.unitPrice,
      totalPrice: budgetItem.totalPrice,
      budgetId: budgetItem.budgetId,
      notes: budgetItem.notes,
      stockItemId: budgetItem.stockItemId,
      serviceId: budgetItem.serviceId,
      createdAt: budgetItem.createdAt.toISOString(),
      updatedAt: budgetItem.updatedAt?.toISOString() ?? budgetItem.createdAt.toISOString(),
    }
  }

  /**
   * Format paginated BudgetItem data for HTTP response
   * @param data - Paginated BudgetItem response DTO from application layer
   * @returns Formatted paginated BudgetItem data for HTTP transport
   */
  presentPaginatedBudgetItems(
    data: PaginatedBudgetItemsResponseDto,
  ): PaginatedBudgetItemsHttpResponse {
    return super.presentPaginated(data)
  }
}

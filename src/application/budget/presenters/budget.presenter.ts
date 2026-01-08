import { BudgetResponseDto, PaginatedBudgetsResponseDto } from '@application/budget/dto'
import { BasePresenter } from '@shared/bases'

/**
 * HTTP response format for Budget data
 */
export interface BudgetHttpResponse {
  id: string
  status: string
  totalAmount: string
  validityPeriod: number
  generationDate: string
  sentDate?: string
  approvalDate?: string
  rejectionDate?: string
  deliveryMethod?: string
  notes?: string
  serviceOrderId: string
  clientId: string
  createdAt: string
  updatedAt: string
}

/**
 * HTTP response format for paginated Budgets
 */
export interface PaginatedBudgetsHttpResponse {
  data: BudgetHttpResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Presenter for Budget data formatting
 * Separates business data structure from HTTP response format
 */
export class BudgetPresenter extends BasePresenter<BudgetResponseDto, BudgetHttpResponse> {
  /**
   * Formats Budget business data for HTTP response
   * @param budget - Budget data from application layer
   * @returns Formatted Budget for HTTP transport
   */
  present(budget: BudgetResponseDto): BudgetHttpResponse {
    return {
      id: budget.id,
      status: budget.status,
      totalAmount: budget.totalAmount,
      validityPeriod: budget.validityPeriod,
      generationDate: budget.generationDate.toISOString(),
      sentDate: budget.sentDate?.toISOString(),
      approvalDate: budget.approvalDate?.toISOString(),
      rejectionDate: budget.rejectionDate?.toISOString(),
      deliveryMethod: budget.deliveryMethod,
      notes: budget.notes,
      serviceOrderId: budget.serviceOrderId,
      clientId: budget.clientId,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString(),
    }
  }

  /**
   * Formats paginated Budgets data for HTTP response
   * @param data - Paginated Budgets from application layer
   * @returns Formatted paginated response for HTTP transport
   */
  presentPaginatedBudgets(data: PaginatedBudgetsResponseDto): PaginatedBudgetsHttpResponse {
    return this.presentPaginated(data)
  }
}

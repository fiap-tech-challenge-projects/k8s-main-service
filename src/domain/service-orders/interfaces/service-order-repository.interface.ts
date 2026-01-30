import { ServiceOrderStatus } from '@prisma/client'

import { ServiceOrder } from '@domain/service-orders/entities'
import { IBaseRepository, PaginatedResult } from '@shared'

export const SERVICE_ORDER_REPOSITORY = Symbol('SERVICE_ORDER_REPOSITORY')

/**
 * Repository interface for Service Order domain operations
 * Extends base repository with service order-specific query methods
 */
export interface IServiceOrderRepository extends IBaseRepository<ServiceOrder> {
  /**
   * Find service orders by status
   * @param status - The status to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findByStatus(
    status: ServiceOrderStatus,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceOrder>>

  /**
   * Find service orders by client ID
   * @param clientId - The client ID to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findByClientId(
    clientId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceOrder>>

  /**
   * Find service orders by vehicle ID
   * @param vehicleId - The vehicle ID to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findByVehicleId(
    vehicleId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceOrder>>

  /**
   * Find service orders by date range
   * @param startDate - Start date for the range
   * @param endDate - End date for the range
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceOrder>>

  /**
   * Find service orders that are overdue (past delivery date)
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findOverdue(page?: number, limit?: number): Promise<PaginatedResult<ServiceOrder>>
}

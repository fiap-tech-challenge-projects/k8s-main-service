import { StockItem, StockMovement } from '@domain/stock/entities'
import { IBaseRepository, PaginatedResult } from '@shared'

export const STOCK_REPOSITORY = Symbol('STOCK_REPOSITORY')

/**
 * Repository interface for Stock domain operations
 * Extends base repository with stock-specific query methods
 */
export interface IStockRepository extends IBaseRepository<StockItem> {
  /**
   * Find stock item by SKU
   * @param sku - The SKU to search for
   * @returns Promise resolving to the stock item or null if not found
   */
  findBySku(sku: string): Promise<StockItem | null>

  /**
   * Check if a SKU is already registered
   * @param sku - The SKU to check
   * @returns Promise resolving to true if SKU exists, false otherwise
   */
  skuExists(sku: string): Promise<boolean>

  /**
   * Find stock items by name (partial match)
   * @param name - The name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findByName(name: string, page?: number, limit?: number): Promise<PaginatedResult<StockItem>>

  /**
   * Find stock items by supplier (partial match)
   * @param supplier - The supplier to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findBySupplier(
    supplier: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<StockItem>>

  /**
   * Create a stock movement and update stock levels
   * @param stockMovement - The stock movement to create
   * @returns Promise resolving to the created stock movement
   */
  createStockMovement(stockMovement: StockMovement): Promise<StockMovement>

  /**
   * Update a stock movement and adjust stock levels accordingly
   * @param id - The unique identifier of the stock movement to update
   * @param updateData - The partial data to update
   * @returns Promise resolving to the updated stock movement
   */
  updateStockMovement(
    id: string,
    updateData: Partial<Omit<StockMovement, 'id' | 'createdAt' | 'stockId'>>,
  ): Promise<StockMovement>
}

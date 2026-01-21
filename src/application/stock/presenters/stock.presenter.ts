import { Injectable } from '@nestjs/common'

import { StockItemResponseDto, PaginatedStockItemDto } from '@application/stock/dto'
import { BasePresenter } from '@shared/bases'

/**
 * HTTP response format for Stock Item data (for Stock Presenter)
 */
export interface StockHttpResponse {
  id: string
  name: string
  sku: string
  currentStock: number
  minStockLevel: number
  unitCost: string
  unitSalePrice: string
  description?: string
  supplier?: string
  createdAt: string
  updatedAt: string
}

/**
 * HTTP response format for paginated Stock Items (from Stock Presenter)
 */
export interface PaginatedStockHttpResponse {
  data: StockHttpResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Presenter for Stock data formatting
 * Separates business data structure from HTTP response format
 */
@Injectable()
export class StockPresenter extends BasePresenter<StockItemResponseDto, StockHttpResponse> {
  /**
   * Formats Stock business data for HTTP response
   * @param stockItem - Stock item data from application layer
   * @returns Formatted Stock item for HTTP transport
   */
  present(stockItem: StockItemResponseDto): StockHttpResponse {
    return {
      id: stockItem.id,
      name: stockItem.name,
      sku: stockItem.sku,
      currentStock: stockItem.currentStock,
      minStockLevel: stockItem.minStockLevel,
      unitCost: stockItem.unitCost,
      unitSalePrice: stockItem.unitSalePrice,
      description: stockItem.description,
      supplier: stockItem.supplier,
      createdAt: stockItem.createdAt.toISOString(),
      updatedAt: stockItem.updatedAt.toISOString(),
    }
  }

  /**
   * Formats paginated Stock Items data for HTTP response
   * @param data - Paginated Stock Items from application layer
   * @returns Formatted paginated response for HTTP transport
   */
  presentPaginatedStockItems(data: PaginatedStockItemDto): PaginatedStockHttpResponse {
    return this.presentPaginated(data)
  }
}

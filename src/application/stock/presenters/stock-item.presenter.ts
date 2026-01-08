import { Injectable } from '@nestjs/common'

import { PaginatedStockItemDto, StockItemResponseDto } from '@application/stock/dto'
import { BasePresenter } from '@shared/bases'

/**
 * HTTP response format for stock item data
 * Adapts StockItemResponseDto to standardized HTTP response format
 * with camelCase field names and proper date serialization
 */
export interface StockItemHttpResponse {
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
 * HTTP response format for paginated stock item data
 */
export type PaginatedStockItemHttpResponse = Awaited<
  ReturnType<BasePresenter<StockItemResponseDto, StockItemHttpResponse>['presentPaginated']>
> & {
  data: StockItemHttpResponse[]
}

/**
 * Presenter for stock item HTTP responses
 * Transforms application layer DTOs into HTTP transport format
 * following the presenter pattern for consistent response formatting
 */
@Injectable()
export class StockItemPresenter extends BasePresenter<StockItemResponseDto, StockItemHttpResponse> {
  /**
   * Format single stock item data for HTTP response
   * @param data - Stock item response DTO from application layer
   * @returns Formatted stock item data for HTTP transport
   */
  present(data: StockItemResponseDto): StockItemHttpResponse {
    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      currentStock: data.currentStock,
      minStockLevel: data.minStockLevel,
      unitCost: data.unitCost,
      unitSalePrice: data.unitSalePrice,
      description: data.description,
      supplier: data.supplier,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    }
  }

  /**
   * Format paginated stock item data for HTTP response
   * @param data - Paginated stock item response DTO from application layer
   * @returns Formatted paginated stock item data for HTTP transport
   */
  presentPaginatedStockItems(data: PaginatedStockItemDto): PaginatedStockItemHttpResponse {
    return super.presentPaginated(data)
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { StockItemResponseDto } from '@application/stock/dto'
import { StockItemMapper } from '@application/stock/mappers'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { EntityNotFoundException } from '@shared/exceptions'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for getting a stock item by SKU
 * Handles the orchestration for stock item retrieval by SKU business process
 */
@Injectable()
export class GetStockItemBySkuUseCase {
  private readonly logger = new Logger(GetStockItemBySkuUseCase.name)

  /**
   * Constructor for GetStockItemBySkuUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute get stock item by SKU
   * @param sku - Stock item SKU
   * @returns Result with stock item response DTO or error
   */
  async execute(sku: string): Promise<Result<StockItemResponseDto, Error>> {
    this.logger.log('Executing get stock item by SKU use case', {
      sku,
      context: 'GetStockItemBySkuUseCase.execute',
    })

    try {
      const stockItem = await this.stockRepository.findBySku(sku)

      if (!stockItem) {
        const error = new EntityNotFoundException('Stock item', `SKU: ${sku}`)
        this.logger.warn('Stock item not found by SKU', {
          sku,
          error: error.message,
          context: 'GetStockItemBySkuUseCase.execute',
        })
        return FAILURE(error)
      }

      const stockItemResponse = StockItemMapper.toResponseDto(stockItem)

      this.logger.log('Get stock item by SKU use case completed successfully', {
        stockItemId: stockItemResponse.id,
        name: stockItemResponse.name,
        sku: stockItemResponse.sku,
        context: 'GetStockItemBySkuUseCase.execute',
      })

      return SUCCESS(stockItemResponse)
    } catch (error) {
      this.logger.error('Get stock item by SKU use case failed', {
        sku,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'GetStockItemBySkuUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

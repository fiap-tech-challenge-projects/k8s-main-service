import { Injectable, Logger, Inject } from '@nestjs/common'

import { StockItemResponseDto } from '@application/stock/dto'
import { StockItemMapper } from '@application/stock/mappers'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { EntityNotFoundException } from '@shared/exceptions'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for getting a stock item by ID
 * Handles the orchestration for stock item retrieval by ID business process
 */
@Injectable()
export class GetStockItemByIdUseCase {
  private readonly logger = new Logger(GetStockItemByIdUseCase.name)

  /**
   * Constructor for GetStockItemByIdUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute get stock item by ID
   * @param id - Stock item ID
   * @returns Result with stock item response DTO or error
   */
  async execute(id: string): Promise<Result<StockItemResponseDto, Error>> {
    this.logger.log('Executing get stock item by ID use case', {
      id,
      context: 'GetStockItemByIdUseCase.execute',
    })

    try {
      const stockItem = await this.stockRepository.findById(id)

      if (!stockItem) {
        const error = new EntityNotFoundException('Stock item', id)
        this.logger.warn('Stock item not found', {
          id,
          error: error.message,
          context: 'GetStockItemByIdUseCase.execute',
        })
        return FAILURE(error)
      }

      const stockItemResponse = StockItemMapper.toResponseDto(stockItem)

      this.logger.log('Get stock item by ID use case completed successfully', {
        stockItemId: stockItemResponse.id,
        name: stockItemResponse.name,
        sku: stockItemResponse.sku,
        context: 'GetStockItemByIdUseCase.execute',
      })

      return SUCCESS(stockItemResponse)
    } catch (error) {
      this.logger.error('Get stock item by ID use case failed', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'GetStockItemByIdUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { CreateStockItemDto, StockItemResponseDto } from '@application/stock/dto'
import { StockItemMapper } from '@application/stock/mappers'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { AlreadyExistsException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for creating a new stock item
 * Handles the orchestration for stock item creation business process
 */
@Injectable()
export class CreateStockItemUseCase {
  private readonly logger = new Logger(CreateStockItemUseCase.name)

  /**
   * Constructor for CreateStockItemUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(@Inject(STOCK_REPOSITORY) private readonly stockRepository: IStockRepository) {}

  /**
   * Execute stock item creation
   * @param createStockItemDto - Stock item creation data
   * @returns Result with stock item response DTO or error
   */
  async execute(
    createStockItemDto: CreateStockItemDto,
  ): Promise<Result<StockItemResponseDto, Error>> {
    this.logger.log('Executing create stock item use case', {
      name: createStockItemDto.name,
      sku: createStockItemDto.sku,
      currentStock: createStockItemDto.currentStock,
      context: 'CreateStockItemUseCase.execute',
    })

    try {
      const existingItem = await this.stockRepository.findBySku(createStockItemDto.sku)

      if (existingItem) {
        const error = new AlreadyExistsException('Stock item', 'sku', createStockItemDto.sku)
        this.logger.warn('Stock item already exists', {
          sku: createStockItemDto.sku,
          error: error.message,
          context: 'CreateStockItemUseCase.execute',
        })
        return new Failure(error)
      }

      const stockItemData = StockItemMapper.fromCreateDto(createStockItemDto)
      const stockItem = await this.stockRepository.create(stockItemData)
      const stockItemResponse = StockItemMapper.toResponseDto(stockItem)

      this.logger.log('Stock item creation use case completed successfully', {
        stockItemId: stockItemResponse.id,
        name: stockItemResponse.name,
        sku: stockItemResponse.sku,
        currentStock: stockItemResponse.currentStock,
        context: 'CreateStockItemUseCase.execute',
      })

      return new Success(stockItemResponse)
    } catch (error) {
      this.logger.error('Stock item creation use case failed', {
        name: createStockItemDto.name,
        sku: createStockItemDto.sku,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'CreateStockItemUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

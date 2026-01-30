import { Injectable, Logger, Inject } from '@nestjs/common'

import { UpdateStockItemDto, StockItemResponseDto } from '@application/stock/dto'
import { StockItemMapper } from '@application/stock/mappers'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { EntityNotFoundException } from '@shared/exceptions'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for updating a stock item
 * Handles the orchestration for stock item update business process
 */
@Injectable()
export class UpdateStockItemUseCase {
  private readonly logger = new Logger(UpdateStockItemUseCase.name)

  /**
   * Constructor for UpdateStockItemUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute stock item update
   * @param id - Stock item ID
   * @param updateStockItemDto - Stock item update data
   * @returns Result with stock item response DTO or error
   */
  async execute(
    id: string,
    updateStockItemDto: UpdateStockItemDto,
  ): Promise<Result<StockItemResponseDto, Error>> {
    this.logger.log('Executing update stock item use case', {
      id,
      updateData: updateStockItemDto,
      context: 'UpdateStockItemUseCase.execute',
    })

    try {
      const existingItem = await this.stockRepository.findById(id)

      if (!existingItem) {
        const error = new EntityNotFoundException('Stock item', id)
        this.logger.warn('Stock item not found for update', {
          id,
          error: error.message,
          context: 'UpdateStockItemUseCase.execute',
        })
        return FAILURE(error)
      }

      const updatedItemData = StockItemMapper.fromUpdateDto(updateStockItemDto, existingItem)
      const updatedItem = await this.stockRepository.update(id, updatedItemData)
      const stockItemResponse = StockItemMapper.toResponseDto(updatedItem)

      this.logger.log('Update stock item use case completed successfully', {
        stockItemId: stockItemResponse.id,
        name: stockItemResponse.name,
        sku: stockItemResponse.sku,
        context: 'UpdateStockItemUseCase.execute',
      })

      return SUCCESS(stockItemResponse)
    } catch (error) {
      this.logger.error('Update stock item use case failed', {
        id,
        updateData: updateStockItemDto,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'UpdateStockItemUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

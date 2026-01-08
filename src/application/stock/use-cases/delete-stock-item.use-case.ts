import { Injectable, Logger, Inject } from '@nestjs/common'

import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { EntityNotFoundException } from '@shared/exceptions'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for deleting a stock item
 * Handles the orchestration for stock item deletion business process
 */
@Injectable()
export class DeleteStockItemUseCase {
  private readonly logger = new Logger(DeleteStockItemUseCase.name)

  /**
   * Constructor for DeleteStockItemUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute stock item deletion
   * @param id - Stock item ID
   * @returns Result with boolean or error
   */
  async execute(id: string): Promise<Result<boolean, Error>> {
    this.logger.log('Executing delete stock item use case', {
      id,
      context: 'DeleteStockItemUseCase.execute',
    })

    try {
      const existingItem = await this.stockRepository.findById(id)

      if (!existingItem) {
        const error = new EntityNotFoundException('Stock item', id)
        this.logger.warn('Stock item not found for deletion', {
          id,
          error: error.message,
          context: 'DeleteStockItemUseCase.execute',
        })
        return FAILURE(error)
      }

      await this.stockRepository.delete(id)

      this.logger.log('Delete stock item use case completed successfully', {
        stockItemId: id,
        context: 'DeleteStockItemUseCase.execute',
      })

      return SUCCESS(true)
    } catch (error) {
      this.logger.error('Delete stock item use case failed', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'DeleteStockItemUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for checking stock availability
 * Handles the orchestration for stock availability check business process
 */
@Injectable()
export class CheckStockAvailabilityUseCase {
  private readonly logger = new Logger(CheckStockAvailabilityUseCase.name)

  /**
   * Constructor for CheckStockAvailabilityUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute stock availability check
   * @param id - Stock item ID
   * @param quantity - Quantity to check
   * @returns Result with boolean or error
   */
  async execute(id: string, quantity: number): Promise<Result<boolean, Error>> {
    this.logger.log('Executing check stock availability use case', {
      id,
      quantity,
      context: 'CheckStockAvailabilityUseCase.execute',
    })

    try {
      const stockItem = await this.stockRepository.findById(id)

      if (!stockItem) {
        this.logger.warn('Stock item not found for availability check', {
          id,
          context: 'CheckStockAvailabilityUseCase.execute',
        })
        return SUCCESS(false)
      }

      const hasStock = stockItem.currentStock >= quantity

      this.logger.log('Check stock availability use case completed successfully', {
        id,
        quantity,
        hasStock,
        currentStock: stockItem.currentStock,
        context: 'CheckStockAvailabilityUseCase.execute',
      })

      return SUCCESS(hasStock)
    } catch (error) {
      this.logger.error('Check stock availability use case failed', {
        id,
        quantity,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'CheckStockAvailabilityUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

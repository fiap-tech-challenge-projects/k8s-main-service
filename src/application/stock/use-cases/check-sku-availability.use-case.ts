import { Injectable, Logger, Inject } from '@nestjs/common'

import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for checking SKU availability
 * Handles the orchestration for SKU availability check business process
 */
@Injectable()
export class CheckSkuAvailabilityUseCase {
  private readonly logger = new Logger(CheckSkuAvailabilityUseCase.name)

  /**
   * Constructor for CheckSkuAvailabilityUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute SKU availability check
   * @param sku - SKU to check
   * @returns Result with boolean or error
   */
  async execute(sku: string): Promise<Result<boolean, Error>> {
    this.logger.log('Executing check SKU availability use case', {
      sku,
      context: 'CheckSkuAvailabilityUseCase.execute',
    })

    try {
      const stockItem = await this.stockRepository.findBySku(sku)
      const available = stockItem === null

      this.logger.log('Check SKU availability use case completed successfully', {
        sku,
        available,
        context: 'CheckSkuAvailabilityUseCase.execute',
      })

      return SUCCESS(available)
    } catch (error) {
      this.logger.error('Check SKU availability use case failed', {
        sku,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'CheckSkuAvailabilityUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

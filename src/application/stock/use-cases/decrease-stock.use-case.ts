import { Injectable, Logger, Inject } from '@nestjs/common'
import { StockMovementType } from '@prisma/client'

import { StockMovementResponseDto } from '@application/stock/dto'
import { StockMovementMapper } from '@application/stock/mappers'
import { StockMovement } from '@domain/stock/entities'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { EntityNotFoundException } from '@shared/exceptions'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for decreasing stock
 * Handles the orchestration for stock decrease business process
 */
@Injectable()
export class DecreaseStockUseCase {
  private readonly logger = new Logger(DecreaseStockUseCase.name)

  /**
   * Constructor for DecreaseStockUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute stock decrease
   * @param stockItemId - Stock item ID
   * @param quantity - Quantity to decrease
   * @param reason - Reason for decrease
   * @returns Result with stock movement response DTO or error
   */
  async execute(
    stockItemId: string,
    quantity: number,
    reason: string,
  ): Promise<Result<StockMovementResponseDto, Error>> {
    this.logger.log('Executing decrease stock use case', {
      stockItemId,
      quantity,
      reason,
      context: 'DecreaseStockUseCase.execute',
    })

    try {
      const stockItem = await this.stockRepository.findById(stockItemId)

      if (!stockItem) {
        const error = new EntityNotFoundException('Stock item', stockItemId)
        this.logger.warn('Stock item not found for decrease', {
          stockItemId,
          error: error.message,
          context: 'DecreaseStockUseCase.execute',
        })
        return FAILURE(error)
      }

      const movementData = StockMovement.create(
        StockMovementType.OUT,
        quantity,
        new Date(),
        stockItemId,
        reason,
      )

      const movement = await this.stockRepository.createStockMovement(movementData)
      const movementResponse = StockMovementMapper.toResponseDto(movement)

      this.logger.log('Decrease stock use case completed successfully', {
        stockItemId,
        quantity,
        reason,
        movementId: movementResponse.id,
        context: 'DecreaseStockUseCase.execute',
      })

      return SUCCESS(movementResponse)
    } catch (error) {
      this.logger.error('Decrease stock use case failed', {
        stockItemId,
        quantity,
        reason,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'DecreaseStockUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

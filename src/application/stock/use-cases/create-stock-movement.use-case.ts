import { Injectable, Logger, Inject } from '@nestjs/common'

import { CreateStockMovementDto, StockMovementResponseDto } from '@application/stock/dto'
import { StockMovementMapper } from '@application/stock/mappers'
import { StockMovement } from '@domain/stock/entities'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { EntityNotFoundException } from '@shared/exceptions'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for creating a stock movement
 * Handles the orchestration for stock movement creation business process
 */
@Injectable()
export class CreateStockMovementUseCase {
  private readonly logger = new Logger(CreateStockMovementUseCase.name)

  /**
   * Constructor for CreateStockMovementUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute stock movement creation
   * @param createStockMovementDto - Stock movement creation data
   * @returns Result with stock movement response DTO or error
   */
  async execute(
    createStockMovementDto: CreateStockMovementDto,
  ): Promise<Result<StockMovementResponseDto, Error>> {
    this.logger.log('Executing create stock movement use case', {
      stockId: createStockMovementDto.stockId,
      quantity: createStockMovementDto.quantity,
      type: createStockMovementDto.type,
      context: 'CreateStockMovementUseCase.execute',
    })

    try {
      const stockItem = await this.stockRepository.findById(createStockMovementDto.stockId)

      if (!stockItem) {
        const error = new EntityNotFoundException('Stock item', createStockMovementDto.stockId)
        this.logger.warn('Stock item not found for movement creation', {
          stockId: createStockMovementDto.stockId,
          error: error.message,
          context: 'CreateStockMovementUseCase.execute',
        })
        return FAILURE(error)
      }

      const movementDate = createStockMovementDto.movementDate
        ? new Date(createStockMovementDto.movementDate)
        : new Date()

      const movementData = StockMovement.create(
        createStockMovementDto.type,
        createStockMovementDto.quantity,
        movementDate,
        createStockMovementDto.stockId,
        createStockMovementDto.reason,
        createStockMovementDto.notes,
      )

      const movement = await this.stockRepository.createStockMovement(movementData)
      const movementResponse = StockMovementMapper.toResponseDto(movement)

      this.logger.log('Create stock movement use case completed successfully', {
        movementId: movementResponse.id,
        stockId: movementResponse.stockId,
        quantity: movementResponse.quantity,
        type: movementResponse.type,
        context: 'CreateStockMovementUseCase.execute',
      })

      return SUCCESS(movementResponse)
    } catch (error) {
      this.logger.error('Create stock movement use case failed', {
        stockId: createStockMovementDto.stockId,
        quantity: createStockMovementDto.quantity,
        type: createStockMovementDto.type,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'CreateStockMovementUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

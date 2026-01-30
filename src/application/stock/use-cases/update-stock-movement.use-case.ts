import { Injectable, Logger, Inject } from '@nestjs/common'

import { UpdateStockMovementDto, StockMovementResponseDto } from '@application/stock/dto'
import { StockMovementMapper } from '@application/stock/mappers'
import { StockMovement } from '@domain/stock/entities'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for updating a stock movement
 * Handles the orchestration for stock movement update business process
 */
@Injectable()
export class UpdateStockMovementUseCase {
  private readonly logger = new Logger(UpdateStockMovementUseCase.name)

  /**
   * Constructor for UpdateStockMovementUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute stock movement update
   * @param id - Stock movement ID
   * @param updateStockMovementDto - Stock movement update data
   * @returns Result with stock movement response DTO or error
   */
  async execute(
    id: string,
    updateStockMovementDto: UpdateStockMovementDto,
  ): Promise<Result<StockMovementResponseDto, Error>> {
    this.logger.log('Executing update stock movement use case', {
      id,
      updateData: updateStockMovementDto,
      context: 'UpdateStockMovementUseCase.execute',
    })

    try {
      const updateData: Partial<Omit<StockMovement, 'id' | 'createdAt' | 'stockId'>> = {
        ...(updateStockMovementDto.type && { type: updateStockMovementDto.type }),
        ...(updateStockMovementDto.quantity && { quantity: updateStockMovementDto.quantity }),
        ...(updateStockMovementDto.movementDate && {
          movementDate: new Date(updateStockMovementDto.movementDate),
        }),
        ...(updateStockMovementDto.reason && { reason: updateStockMovementDto.reason }),
        ...(updateStockMovementDto.notes && { notes: updateStockMovementDto.notes }),
        updatedAt: new Date(),
      }

      const updatedMovement = await this.stockRepository.updateStockMovement(id, updateData)
      const movementResponse = StockMovementMapper.toResponseDto(updatedMovement)

      this.logger.log('Update stock movement use case completed successfully', {
        movementId: movementResponse.id,
        stockId: movementResponse.stockId,
        quantity: movementResponse.quantity,
        type: movementResponse.type,
        context: 'UpdateStockMovementUseCase.execute',
      })

      return SUCCESS(movementResponse)
    } catch (error) {
      this.logger.error('Update stock movement use case failed', {
        id,
        updateData: updateStockMovementDto,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'UpdateStockMovementUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

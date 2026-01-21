import { StockMovement } from '@domain/stock/entities'
import { validateBaseMapper } from '@shared'

import { CreateStockMovementDto, UpdateStockMovementDto, StockMovementResponseDto } from '../dto'

/**
 * Mapper for converting between StockMovement DTOs and domain entities
 */
export class StockMovementMapper {
  /**
   * Converts a CreateStockMovementDto to a StockMovement domain entity
   * @param dto - The DTO containing stock movement creation data
   * @returns StockMovement domain entity
   */
  static fromCreateDto(dto: CreateStockMovementDto): StockMovement {
    const movementDate = dto.movementDate ? new Date(dto.movementDate) : new Date()

    return StockMovement.create(
      dto.type,
      dto.quantity,
      movementDate,
      dto.stockId,
      dto.reason,
      dto.notes,
    )
  }

  /**
   * Converts an UpdateStockMovementDto to an updated StockMovement domain entity
   * @param dto - The DTO containing update data
   * @param existing - The existing StockMovement domain entity
   * @returns Updated StockMovement domain entity
   */
  static fromUpdateDto(dto: UpdateStockMovementDto, existing: StockMovement): StockMovement {
    if (dto.type !== undefined && dto.type !== existing.type) {
      existing.updateType(dto.type)
    }

    if (dto.quantity !== undefined && dto.quantity !== existing.quantity) {
      existing.updateQuantity(dto.quantity)
    }

    if (dto.movementDate !== undefined) {
      const movementDate = new Date(dto.movementDate)
      if (movementDate.getTime() !== existing.movementDate.getTime()) {
        existing.updateMovementDate(movementDate)
      }
    }

    if (dto.reason !== undefined && dto.reason !== existing.reason) {
      existing.updateReason(dto.reason)
    }

    if (dto.notes !== undefined && dto.notes !== existing.notes) {
      existing.updateNotes(dto.notes)
    }

    return existing
  }

  /**
   * Converts a StockMovement domain entity to a StockMovementResponseDto
   * @param stockMovement - The StockMovement domain entity
   * @returns StockMovementResponseDto
   */
  static toResponseDto(stockMovement: StockMovement): StockMovementResponseDto {
    return {
      id: stockMovement.id,
      type: stockMovement.type,
      quantity: stockMovement.quantity,
      movementDate: stockMovement.movementDate,
      stockId: stockMovement.stockId,
      reason: stockMovement.reason,
      notes: stockMovement.notes,
      createdAt: stockMovement.createdAt,
      updatedAt: stockMovement.updatedAt,
    }
  }

  /**
   * Converts an array of StockMovement domain entities to StockMovementResponseDto array
   * @param stockMovements - Array of StockMovement domain entities
   * @returns Array of StockMovementResponseDto
   */
  static toResponseDtoArray(stockMovements: StockMovement[]): StockMovementResponseDto[] {
    return stockMovements.map((movement) => this.toResponseDto(movement))
  }
}

// Validate that this mapper implements the required contract
validateBaseMapper<
  StockMovement,
  StockMovementResponseDto,
  CreateStockMovementDto,
  UpdateStockMovementDto
>(StockMovementMapper, 'StockMovementMapper')

import {
  CreateBudgetItemDto,
  UpdateBudgetItemDto,
  BudgetItemResponseDto,
} from '@application/budget-items/dto'
import { BudgetItem } from '@domain/budget-items/entities'
import { validateBaseMapper } from '@shared'

/**
 * Mapper class for converting between budget item domain entities and DTOs.
 * Implements the BaseMapper contract with static methods.
 */
export class BudgetItemMapper {
  /**
   * Maps a BudgetItem entity to a BudgetItemResponseDto.
   * @param entity - BudgetItem domain entity
   * @returns Mapped BudgetItemResponseDto
   */
  static toResponseDto(entity: BudgetItem): BudgetItemResponseDto {
    return {
      id: entity.id,
      type: entity.type,
      description: entity.description,
      quantity: entity.quantity,
      unitPrice: entity.getFormattedUnitPrice(),
      totalPrice: entity.getFormattedTotalPrice(),
      budgetId: entity.budgetId,
      notes: entity.notes,
      stockItemId: entity.stockItemId,
      serviceId: entity.serviceId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  /**
   * Maps an array of BudgetItem entities to an array of BudgetItemResponseDto.
   * @param entities - Array of BudgetItem domain entities
   * @returns Array of mapped BudgetItemResponseDto
   */
  static toResponseDtoArray(entities: BudgetItem[]): BudgetItemResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity))
  }

  /**
   * Maps a CreateBudgetItemDto to a BudgetItem entity.
   * @param dto - DTO for creating a new budget item
   * @returns Mapped BudgetItem entity
   */
  static fromCreateDto(dto: CreateBudgetItemDto): BudgetItem {
    return BudgetItem.create(
      dto.type,
      dto.description,
      dto.quantity,
      dto.unitPrice,
      dto.budgetId,
      dto.notes,
      dto.stockItemId,
      dto.serviceId,
    )
  }

  /**
   * Maps an UpdateBudgetItemDto to update an existing BudgetItem entity.
   * @param dto - DTO for updating an existing budget item
   * @param existing - Existing BudgetItem entity to be updated
   * @returns The updated BudgetItem entity (mutable)
   */
  static fromUpdateDto(dto: UpdateBudgetItemDto, existing: BudgetItem): BudgetItem {
    if (dto.type !== undefined && dto.type !== existing.type) {
      existing.updateType(dto.type)
    }

    if (dto.description !== undefined && dto.description !== existing.description) {
      existing.updateDescription(dto.description)
    }

    if (dto.quantity !== undefined && dto.quantity !== existing.quantity) {
      existing.updateQuantity(dto.quantity)
    }

    if (dto.unitPrice !== undefined && dto.unitPrice !== existing.getFormattedUnitPrice()) {
      existing.updateUnitPrice(dto.unitPrice)
    }

    if (dto.notes !== undefined && dto.notes !== existing.notes) {
      existing.updateNotes(dto.notes)
    }

    if (dto.stockItemId !== undefined && dto.stockItemId !== existing.stockItemId) {
      existing.updateStockItemId(dto.stockItemId)
    }

    if (dto.serviceId !== undefined && dto.serviceId !== existing.serviceId) {
      existing.updateServiceId(dto.serviceId)
    }

    return existing
  }
}

// Validate that this mapper implements the BaseMapper contract
validateBaseMapper(BudgetItemMapper, 'BudgetItemMapper')

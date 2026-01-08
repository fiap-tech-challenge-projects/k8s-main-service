import type {
  CreateStockItemDto,
  StockItemResponseDto,
  UpdateStockItemDto,
} from '@application/stock/dto'
import { StockItem } from '@domain/stock/entities'
import { validateBaseMapper } from '@shared'

/**
 * Mapper for Stock Item Entity and DTOs
 * Handles the conversion between domain entities and application DTOs
 */
export class StockItemMapper {
  /**
   * Convert StockItem to StockItemResponseDto
   * @param entity - The stock item entity from domain layer
   * @returns StockItemResponseDto - The response DTO for the application layer
   */
  static toResponseDto(entity: StockItem): StockItemResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      sku: entity.sku,
      currentStock: entity.currentStock,
      minStockLevel: entity.minStockLevel,
      unitCost: entity.getFormattedUnitCost(),
      unitSalePrice: entity.getFormattedUnitSalePrice(),
      description: entity.description,
      supplier: entity.supplier,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  /**
   * Convert RegisterStockItemDto to domain entity creation data
   * @param dto - The register stock item DTO from the application layer
   * @returns StockItem - The created stock item entity
   */
  static fromCreateDto(dto: CreateStockItemDto): StockItem {
    return StockItem.create(
      dto.name,
      dto.sku,
      dto.currentStock,
      dto.minStockLevel,
      dto.unitCost,
      dto.unitSalePrice,
      dto.description,
      dto.supplier,
    )
  }

  /**
   * Convert array of StockItem to array of StockItemResponseDto
   * @param entities - Array of stock item entities from domain layer
   * @returns Array of StockItemResponseDto for the application layer
   */
  static toResponseDtoArray(entities: StockItem[]): StockItemResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity))
  }

  /**
   * Convert UpdateStockItemDto to domain entity update data
   * @param updateStockItemDto - The update stock item DTO from the application layer
   * @param existingStockItem - The existing stock item entity from the domain layer
   * @returns StockItem - The updated stock item entity
   */
  static fromUpdateDto(
    updateStockItemDto: UpdateStockItemDto,
    existingStockItem: StockItem,
  ): StockItem {
    if (
      updateStockItemDto.name !== undefined &&
      updateStockItemDto.name !== existingStockItem.name
    ) {
      existingStockItem.updateName(updateStockItemDto.name)
    }

    if (
      updateStockItemDto.description !== undefined &&
      updateStockItemDto.description !== existingStockItem.description
    ) {
      existingStockItem.updateDescription(updateStockItemDto.description)
    }

    if (
      updateStockItemDto.currentStock !== undefined &&
      updateStockItemDto.currentStock !== existingStockItem.currentStock
    ) {
      existingStockItem.updateCurrentStock(updateStockItemDto.currentStock)
    }

    if (
      updateStockItemDto.minStockLevel !== undefined &&
      updateStockItemDto.minStockLevel !== existingStockItem.minStockLevel
    ) {
      existingStockItem.updateMinStockLevel(updateStockItemDto.minStockLevel)
    }

    if (
      updateStockItemDto.unitCost !== undefined &&
      updateStockItemDto.unitCost !== existingStockItem.getFormattedUnitCost()
    ) {
      existingStockItem.updateUnitCost(updateStockItemDto.unitCost)
    }

    if (
      updateStockItemDto.unitSalePrice !== undefined &&
      updateStockItemDto.unitSalePrice !== existingStockItem.getFormattedUnitSalePrice()
    ) {
      existingStockItem.updateUnitSalePrice(updateStockItemDto.unitSalePrice)
    }

    if (
      updateStockItemDto.supplier !== undefined &&
      updateStockItemDto.supplier !== existingStockItem.supplier
    ) {
      existingStockItem.updateSupplier(updateStockItemDto.supplier)
    }

    return existingStockItem
  }
}

// Validate that this mapper implements the required contract
validateBaseMapper<StockItem, StockItemResponseDto, CreateStockItemDto, UpdateStockItemDto>(
  StockItemMapper,
  'StockItemMapper',
)

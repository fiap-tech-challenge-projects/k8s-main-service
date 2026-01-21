import { StockItem as PrismaStockItem, Prisma } from '@prisma/client'

import { StockItem } from '@domain/stock/entities'
import { validateBasePrismaMapper } from '@shared/bases'
import { Price } from '@shared/value-objects'

type PrismaStockItemCreateInput = Prisma.StockItemUncheckedCreateInput
type PrismaStockItemUpdateInput = Prisma.StockItemUncheckedUpdateInput

/**
 * Mapper for converting between Prisma Stock models and StockItem domain entities
 */
export class StockMapper {
  /**
   * Converts a Prisma Stock model to a StockItem domain entity
   * @param prismaStockItem - The Prisma Stock model from the database
   * @returns StockItem domain entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  static toDomain(prismaStockItem: PrismaStockItem): StockItem {
    if (!prismaStockItem) {
      throw new Error('Prisma Stock model cannot be null or undefined')
    }

    return new StockItem(
      prismaStockItem.id,
      prismaStockItem.name,
      prismaStockItem.sku,
      prismaStockItem.currentStock,
      prismaStockItem.minStockLevel,
      Price.create(prismaStockItem.unitCost),
      Price.create(prismaStockItem.unitSalePrice),
      prismaStockItem.description ?? undefined,
      prismaStockItem.supplier ?? undefined,
      prismaStockItem.createdAt,
      prismaStockItem.updatedAt,
    )
  }

  /**
   * Converts multiple Prisma Stock models to StockItem domain entities
   * @param prismaStockItems - Array of Prisma Stock models
   * @returns Array of StockItem domain entities
   */
  static toDomainMany(prismaStockItems: PrismaStockItem[]): StockItem[] {
    if (!Array.isArray(prismaStockItems)) {
      return []
    }

    return prismaStockItems
      .filter((stockItem) => stockItem !== null && stockItem !== undefined)
      .map((stockItem) => this.toDomain(stockItem))
  }

  /**
   * Converts a StockItem domain entity to a Prisma StockItem create input
   * @param entity - The StockItem domain entity to convert
   * @returns Prisma StockItem create input
   */
  static toPrismaCreate(entity: StockItem): PrismaStockItemCreateInput {
    if (!entity) {
      throw new Error('StockItem domain entity cannot be null or undefined')
    }

    return {
      sku: entity.sku,
      name: entity.name,
      description: entity.description,
      unitCost: entity.unitCost.getValue(),
      unitSalePrice: entity.unitSalePrice.getValue(),
      currentStock: entity.currentStock,
      minStockLevel: entity.minStockLevel,
      supplier: entity.supplier,
    }
  }

  /**
   * Converts a StockItem domain entity to a Prisma StockItem update input
   * @param entity - The StockItem domain entity to convert
   * @returns Prisma StockItem update input
   */
  static toPrismaUpdate(entity: StockItem): PrismaStockItemUpdateInput {
    if (!entity) {
      throw new Error('StockItem domain entity cannot be null or undefined')
    }

    return {
      name: entity.name,
      description: entity.description,
      unitCost: entity.unitCost.getValue(),
      unitSalePrice: entity.unitSalePrice.getValue(),
      currentStock: entity.currentStock,
      minStockLevel: entity.minStockLevel,
      supplier: entity.supplier,
      updatedAt: new Date(),
    }
  }
}

// Validate that this mapper implements the required contract
validateBasePrismaMapper<
  StockItem,
  PrismaStockItem,
  PrismaStockItemCreateInput,
  PrismaStockItemUpdateInput
>(StockMapper, 'StockMapper')

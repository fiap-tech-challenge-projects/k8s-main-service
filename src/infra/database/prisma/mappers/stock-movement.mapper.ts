import { StockMovement as PrismaStockMovement, Prisma, StockMovementType } from '@prisma/client'

import { StockMovement } from '@domain/stock/entities'
import { validateBasePrismaMapper } from '@shared/bases'

type PrismaStockMovementCreateInput = Prisma.StockMovementUncheckedCreateInput
type PrismaStockMovementUpdateInput = Prisma.StockMovementUncheckedUpdateInput

/**
 * Mapper for converting between Prisma StockMovement models and StockMovement domain entities
 */
export class StockMovementMapper {
  /**
   * Converts a Prisma StockMovement model to a StockMovement domain entity
   * @param prismaStockMovement - The Prisma StockMovement model from the database
   * @returns StockMovement domain entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  static toDomain(prismaStockMovement: PrismaStockMovement): StockMovement {
    if (!prismaStockMovement) {
      throw new Error('Prisma StockMovement model cannot be null or undefined')
    }

    return new StockMovement(
      prismaStockMovement.id,
      prismaStockMovement.type as StockMovementType,
      prismaStockMovement.quantity,
      prismaStockMovement.movementDate,
      prismaStockMovement.stockId,
      prismaStockMovement.reason ?? undefined,
      prismaStockMovement.notes ?? undefined,
      prismaStockMovement.createdAt,
      prismaStockMovement.updatedAt,
    )
  }

  /**
   * Converts multiple Prisma StockMovement models to StockMovement domain entities
   * @param prismaStockMovements - Array of Prisma StockMovement models
   * @returns Array of StockMovement domain entities
   */
  static toDomainMany(prismaStockMovements: PrismaStockMovement[]): StockMovement[] {
    if (!Array.isArray(prismaStockMovements)) {
      return []
    }

    return prismaStockMovements
      .filter((movement) => movement !== null && movement !== undefined)
      .map((movement) => this.toDomain(movement))
  }

  /**
   * Converts a StockMovement domain entity to Prisma create data
   * @param stockMovement - The StockMovement domain entity to convert
   * @returns Prisma create input data
   */
  static toPrismaCreate(stockMovement: StockMovement): PrismaStockMovementCreateInput {
    if (!stockMovement) {
      throw new Error('StockMovement domain entity cannot be null or undefined')
    }

    return {
      id: stockMovement.id,
      type: stockMovement.type,
      quantity: stockMovement.quantity,
      movementDate: stockMovement.movementDate,
      stockId: stockMovement.stockId,
      reason: stockMovement.reason ?? null,
      notes: stockMovement.notes ?? null,
      createdAt: stockMovement.createdAt,
      updatedAt: stockMovement.updatedAt,
    }
  }

  /**
   * Converts a StockMovement domain entity to Prisma update data
   * @param updateData - The partial StockMovement data to convert
   * @returns Prisma update input data
   */
  static toPrismaUpdate(
    updateData: Partial<Omit<StockMovement, 'id' | 'createdAt' | 'stockId'>>,
  ): PrismaStockMovementUpdateInput {
    const result: PrismaStockMovementUpdateInput = {}

    if (updateData.type !== undefined) {
      result.type = updateData.type
    }

    if (updateData.quantity !== undefined) {
      result.quantity = updateData.quantity
    }

    if (updateData.movementDate !== undefined) {
      result.movementDate = updateData.movementDate
    }

    if (updateData.reason !== undefined) {
      result.reason = updateData.reason ?? null
    }

    if (updateData.notes !== undefined) {
      result.notes = updateData.notes ?? null
    }

    if (updateData.updatedAt !== undefined) {
      result.updatedAt = updateData.updatedAt
    }

    return result
  }
}

// Validate that this mapper implements the required contract
validateBasePrismaMapper<
  StockMovement,
  PrismaStockMovement,
  PrismaStockMovementCreateInput,
  PrismaStockMovementUpdateInput
>(StockMovementMapper, 'StockMovementMapper')

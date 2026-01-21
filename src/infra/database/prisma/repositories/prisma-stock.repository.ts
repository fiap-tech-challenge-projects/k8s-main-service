import { Injectable } from '@nestjs/common'
import { StockItem as PrismaStockItem, StockMovementType } from '@prisma/client'

import { StockItem, StockMovement } from '@domain/stock/entities'
import {
  InsufficientStockException,
  InvalidStockMovementTypeException,
} from '@domain/stock/exceptions'
import type { IStockRepository } from '@domain/stock/interfaces'
import { BasePrismaRepository } from '@infra/database/common'
import { StockMapper, StockMovementMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PaginatedResult } from '@shared'

/**
 * Prisma implementation of the Stock repository
 */
@Injectable()
export class PrismaStockRepository
  extends BasePrismaRepository<StockItem, PrismaStockItem>
  implements IStockRepository
{
  /**
   * Constructor for PrismaStockRepository
   * @param prisma - The Prisma service dependency
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaStockRepository.name)
  }

  protected get modelName(): string {
    return 'stockItem'
  }

  protected get mapper(): (prismaModel: PrismaStockItem) => StockItem {
    return StockMapper.toDomain
  }

  protected get createMapper(): (entity: StockItem) => Record<string, unknown> {
    return (entity: StockItem) => StockMapper.toPrismaCreate(entity) as Record<string, unknown>
  }

  protected get updateMapper(): (entity: StockItem) => Record<string, unknown> {
    return (entity: StockItem) => StockMapper.toPrismaUpdate(entity) as Record<string, unknown>
  }

  /**
   * Find stock item by SKU
   * @param sku - The SKU to search for
   * @returns Promise resolving to the stock item or null if not found
   */
  async findBySku(sku: string): Promise<StockItem | null> {
    try {
      return this.findByUniqueField('sku', sku)
    } catch (error) {
      this.logger.error(`Error finding stock item by SKU ${sku}:`, error)
      throw error
    }
  }

  /**
   * Check if a SKU is already registered
   * @param sku - The SKU to check
   * @returns Promise resolving to true if SKU exists, false otherwise
   */
  async skuExists(sku: string): Promise<boolean> {
    try {
      return this.uniqueFieldExists('sku', sku)
    } catch (error) {
      this.logger.error(`Error checking if SKU exists ${sku}:`, error)
      throw error
    }
  }

  /**
   * Find stock items by name (partial match)
   * @param name - The name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByName(
    name: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<StockItem>> {
    return this.findPaginated(
      {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      page,
      limit,
      { createdAt: 'desc' },
    )
  }

  /**
   * Find stock items by supplier (partial match)
   * @param supplier - The supplier to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findBySupplier(
    supplier: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<StockItem>> {
    return this.findPaginated(
      {
        supplier: {
          contains: supplier,
          mode: 'insensitive',
        },
      },
      page,
      limit,
      { createdAt: 'desc' },
    )
  }

  /**
   * Create a stock movement and update stock levels
   * @param stockMovement - The stock movement to create
   * @returns Promise resolving to the created stock movement
   */
  async createStockMovement(stockMovement: StockMovement): Promise<StockMovement> {
    try {
      // Start a transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // First, get the current stock item
        const currentStockItem = await tx.stockItem.findUnique({
          where: { id: stockMovement.stockId },
        })

        if (!currentStockItem) {
          throw new Error(`Stock item with ID ${stockMovement.stockId} not found`)
        }

        // Calculate new stock level based on movement type
        let newStockLevel = currentStockItem.currentStock

        switch (stockMovement.type) {
          case StockMovementType.IN:
            newStockLevel += stockMovement.quantity
            break
          case StockMovementType.OUT:
            newStockLevel -= stockMovement.quantity
            if (newStockLevel < 0) {
              throw new InsufficientStockException(
                currentStockItem.currentStock,
                stockMovement.quantity,
                stockMovement.stockId,
              )
            }
            break
          case StockMovementType.ADJUSTMENT:
            // For adjustments, the quantity represents the final amount
            newStockLevel = stockMovement.quantity
            break
          default:
            throw new InvalidStockMovementTypeException(stockMovement.type)
        }

        // Create the stock movement record
        const prismaMovementData = StockMovementMapper.toPrismaCreate(stockMovement)
        const createdMovement = await tx.stockMovement.create({
          data: prismaMovementData,
        })

        // Update the stock item with new stock level
        await tx.stockItem.update({
          where: { id: stockMovement.stockId },
          data: {
            currentStock: newStockLevel,
            updatedAt: new Date(),
          },
        })

        return createdMovement
      })

      // Convert back to domain entity
      return StockMovementMapper.toDomain(result)
    } catch (error) {
      this.logger.error(`Error creating stock movement:`, error)
      throw error
    }
  }

  /**
   * Update a stock movement and adjust stock levels accordingly
   * @param id - The unique identifier of the stock movement to update
   * @param updateData - The partial data to update
   * @returns Promise resolving to the updated stock movement
   */
  async updateStockMovement(
    id: string,
    updateData: Partial<Omit<StockMovement, 'id' | 'createdAt' | 'stockId'>>,
  ): Promise<StockMovement> {
    try {
      // Start a transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // First, get the existing stock movement
        const existingMovement = await tx.stockMovement.findUnique({
          where: { id },
        })

        if (!existingMovement) {
          throw new Error(`Stock movement with ID ${id} not found`)
        }

        // Get the current stock item
        const currentStockItem = await tx.stockItem.findUnique({
          where: { id: existingMovement.stockId },
        })

        if (!currentStockItem) {
          throw new Error(`Stock item with ID ${existingMovement.stockId} not found`)
        }

        // Calculate the reversal of the existing movement to restore original stock level
        let stockAdjustment = 0
        switch (existingMovement.type as StockMovementType) {
          case StockMovementType.IN:
            stockAdjustment -= existingMovement.quantity
            break
          case StockMovementType.OUT:
            stockAdjustment += existingMovement.quantity
            break
          case StockMovementType.ADJUSTMENT:
            // For adjustments, we need to handle this differently if type changes
            break
        }

        // Apply the new movement calculation if quantity or type changed
        if (updateData.quantity !== undefined || updateData.type !== undefined) {
          const newQuantity = updateData.quantity ?? existingMovement.quantity
          const newType = updateData.type ?? (existingMovement.type as StockMovementType)

          switch (newType) {
            case StockMovementType.IN:
              stockAdjustment += newQuantity
              break
            case StockMovementType.OUT:
              stockAdjustment -= newQuantity
              break
            case StockMovementType.ADJUSTMENT:
              // For adjustments, calculate the difference needed to reach the target
              stockAdjustment = newQuantity - currentStockItem.currentStock + stockAdjustment
              break
          }

          const newStockLevel = currentStockItem.currentStock + stockAdjustment

          if (newStockLevel < 0) {
            throw new InsufficientStockException(currentStockItem.currentStock, stockAdjustment)
          }

          // Update the stock item
          await tx.stockItem.update({
            where: { id: existingMovement.stockId },
            data: {
              currentStock: newStockLevel,
              updatedAt: new Date(),
            },
          })
        }

        // Update the stock movement
        const prismaUpdateData = StockMovementMapper.toPrismaUpdate(updateData)
        const updatedMovement = await tx.stockMovement.update({
          where: { id },
          data: prismaUpdateData,
        })

        return updatedMovement
      })

      // Convert back to domain entity
      return StockMovementMapper.toDomain(result)
    } catch (error) {
      this.logger.error(`Error updating stock movement ${id}:`, error)
      throw error
    }
  }
}

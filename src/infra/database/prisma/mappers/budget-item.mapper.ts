import { BudgetItem as PrismaBudgetItem, Prisma } from '@prisma/client'

import { BudgetItem } from '@domain/budget-items/entities'
import { validateBasePrismaMapper } from '@shared/bases'
import { Price } from '@shared/value-objects'

type PrismaBudgetItemCreateInput = Prisma.BudgetItemUncheckedCreateInput
type PrismaBudgetItemUpdateInput = Prisma.BudgetItemUncheckedUpdateInput

/**
 * Mapper for converting between Prisma BudgetItem models and BudgetItem domain entities
 */
export class BudgetItemMapper {
  /**
   * Converts a Prisma BudgetItem model to a BudgetItem domain entity
   * @param prismaBudgetItem - The Prisma BudgetItem model from the database
   * @returns BudgetItem domain entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  static toDomain(prismaBudgetItem: PrismaBudgetItem): BudgetItem {
    if (!prismaBudgetItem) {
      throw new Error('Prisma BudgetItem model cannot be null or undefined')
    }

    return new BudgetItem(
      prismaBudgetItem.id,
      prismaBudgetItem.type,
      prismaBudgetItem.description,
      prismaBudgetItem.quantity,
      Price.create(prismaBudgetItem.unitPrice),
      prismaBudgetItem.budgetId,
      prismaBudgetItem.notes ?? undefined,
      prismaBudgetItem.stockItemId ?? undefined,
      prismaBudgetItem.serviceId ?? undefined,
      prismaBudgetItem.createdAt,
      prismaBudgetItem.createdAt, // updatedAt not in schema, use createdAt
    )
  }

  /**
   * Converts multiple Prisma BudgetItem models to BudgetItem domain entities
   * @param prismaBudgetItems - Array of Prisma BudgetItem models
   * @returns Array of BudgetItem domain entities
   */
  static toDomainMany(prismaBudgetItems: PrismaBudgetItem[]): BudgetItem[] {
    if (!Array.isArray(prismaBudgetItems)) {
      return []
    }

    return prismaBudgetItems
      .filter((item) => item !== null && item !== undefined)
      .map((item) => this.toDomain(item))
  }

  /**
   * Converts a BudgetItem domain entity to a Prisma BudgetItem create input
   * @param budgetItem - The BudgetItem domain entity to convert
   * @returns Prisma BudgetItem create input
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaCreate(budgetItem: BudgetItem): PrismaBudgetItemCreateInput {
    if (!budgetItem) {
      throw new Error('BudgetItem domain entity cannot be null or undefined')
    }

    return {
      type: budgetItem.type,
      description: budgetItem.description,
      quantity: budgetItem.quantity,
      unitPrice: budgetItem.unitPrice.getValue(),
      totalPrice: budgetItem.totalPrice.getValue(),
      budgetId: budgetItem.budgetId,
      notes: budgetItem.notes,
      stockItemId: budgetItem.stockItemId,
      serviceId: budgetItem.serviceId,
    }
  }

  /**
   * Converts a BudgetItem domain entity to a Prisma BudgetItem update input
   * @param budgetItem - The BudgetItem domain entity to convert
   * @returns Prisma BudgetItem update input
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaUpdate(budgetItem: BudgetItem): PrismaBudgetItemUpdateInput {
    if (!budgetItem) {
      throw new Error('BudgetItem domain entity cannot be null or undefined')
    }

    return {
      type: budgetItem.type,
      description: budgetItem.description,
      quantity: budgetItem.quantity,
      unitPrice: budgetItem.unitPrice.getValue(),
      totalPrice: budgetItem.totalPrice.getValue(),
      notes: budgetItem.notes,
      stockItemId: budgetItem.stockItemId,
      serviceId: budgetItem.serviceId,
    }
  }
}

// Validate that this mapper implements the required contract
validateBasePrismaMapper<
  BudgetItem,
  PrismaBudgetItem,
  PrismaBudgetItemCreateInput,
  PrismaBudgetItemUpdateInput
>(BudgetItemMapper, 'BudgetItemMapper')

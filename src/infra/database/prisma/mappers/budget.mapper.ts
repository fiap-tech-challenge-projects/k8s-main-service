import { Prisma, Budget as PrismaBudget, BudgetItem as PrismaBudgetItem } from '@prisma/client'

import { Budget } from '@domain/budget/entities'
import { validateBasePrismaMapper } from '@shared/bases'
import { Price } from '@shared/value-objects'

type PrismaBudgetCreateInput = Prisma.BudgetUncheckedCreateInput
type PrismaBudgetUpdateInput = Prisma.BudgetUncheckedUpdateInput

/**
 * Mapper for converting between Prisma Budget models and Budget domain entities
 */
export class BudgetMapper {
  /**
   * Converts a Prisma Budget model to a Budget domain entity
   * @param prismaModel - The Prisma Budget model from the database
   * @returns Budget domain entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  static toDomain(prismaModel: PrismaBudget & { budgetItems?: PrismaBudgetItem[] }): Budget {
    if (!prismaModel) {
      throw new Error('Prisma Budget model cannot be null or undefined')
    }

    return new Budget(
      prismaModel.id,
      prismaModel.status,
      Price.create(prismaModel.totalAmount),
      prismaModel.validityPeriod,
      prismaModel.generationDate,
      prismaModel.serviceOrderId,
      prismaModel.clientId,
      prismaModel.sentDate ?? undefined,
      prismaModel.approvalDate ?? undefined,
      prismaModel.rejectionDate ?? undefined,
      prismaModel.deliveryMethod ?? undefined,
      prismaModel.notes ?? undefined,
      prismaModel.createdAt,
      prismaModel.updatedAt,
    )
  }

  /**
   * Converts multiple Prisma Budget models to Budget domain entities
   * @param prismaModels - Array of Prisma Budget models
   * @returns Array of Budget domain entities
   */
  static toDomainMany(prismaModels: PrismaBudget[]): Budget[] {
    if (!Array.isArray(prismaModels)) {
      return []
    }

    return prismaModels
      .filter((model) => model !== null && model !== undefined)
      .map((model) => this.toDomain(model))
  }

  /**
   * Converts a Budget domain entity to a Prisma Budget create input
   * @param entity - The Budget domain entity to convert
   * @returns Prisma Budget create input
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaCreate(entity: Budget): PrismaBudgetCreateInput {
    if (!entity) {
      throw new Error('Budget domain entity cannot be null or undefined')
    }

    return {
      status: entity.status,
      totalAmount: entity.totalAmount.getValue(),
      validityPeriod: entity.validityPeriod,
      generationDate: entity.generationDate,
      sentDate: entity.sentDate ?? null,
      approvalDate: entity.approvalDate ?? null,
      rejectionDate: entity.rejectionDate ?? null,
      deliveryMethod: entity.deliveryMethod ?? null,
      notes: entity.notes ?? null,
      serviceOrderId: entity.serviceOrderId,
      clientId: entity.clientId,
    }
  }

  /**
   * Converts a Budget domain entity to a Prisma Budget update input
   * @param entity - The Budget domain entity to convert
   * @returns Prisma Budget update input
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaUpdate(entity: Budget): PrismaBudgetUpdateInput {
    if (!entity) {
      throw new Error('Budget domain entity cannot be null or undefined')
    }

    return {
      status: entity.status,
      totalAmount: entity.totalAmount.getValue(),
      validityPeriod: entity.validityPeriod,
      sentDate: entity.sentDate ?? null,
      approvalDate: entity.approvalDate ?? null,
      rejectionDate: entity.rejectionDate ?? null,
      deliveryMethod: entity.deliveryMethod ?? null,
      notes: entity.notes ?? null,
      updatedAt: new Date(),
    }
  }
}

// Validate that this mapper implements the required contract
validateBasePrismaMapper<Budget, PrismaBudget, PrismaBudgetCreateInput, PrismaBudgetUpdateInput>(
  BudgetMapper,
  'BudgetMapper',
)

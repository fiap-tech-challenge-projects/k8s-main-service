import { Injectable } from '@nestjs/common'
import { BudgetItem as PrismaBudgetItem } from '@prisma/client'

import { BudgetItem } from '@domain/budget-items/entities'
import { IBudgetItemRepository } from '@domain/budget-items/interfaces'
import { BasePrismaRepository } from '@infra/database/common'
import { BudgetItemMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PaginatedResult } from '@shared/bases'

/**
 * Prisma implementation of the BudgetItem repository
 */
@Injectable()
export class PrismaBudgetItemRepository
  extends BasePrismaRepository<BudgetItem, PrismaBudgetItem>
  implements IBudgetItemRepository
{
  /**
   * Constructor for PrismaBudgetItemRepository
   * @param prisma - The Prisma service dependency
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaBudgetItemRepository.name)
  }

  protected get modelName(): string {
    return 'budgetItem'
  }

  protected get mapper(): (prismaModel: PrismaBudgetItem) => BudgetItem {
    return BudgetItemMapper.toDomain
  }

  protected get createMapper(): (entity: BudgetItem) => Record<string, unknown> {
    return BudgetItemMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: BudgetItem) => Record<string, unknown> {
    return BudgetItemMapper.toPrismaUpdate
  }

  /**
   * Find budget items by budget ID
   * @param budgetId - Budget's unique identifier
   * @returns Promise resolving to an array of budget items
   */
  async findByBudgetId(budgetId: string): Promise<BudgetItem[]> {
    try {
      const prismaBudgetItems = await this.prisma.budgetItem.findMany({
        where: { budgetId },
      })
      return prismaBudgetItems.map(this.mapper)
    } catch (error) {
      this.logger.error(`Error finding budget items by budget ID ${budgetId}:`, error)
      throw error
    }
  }

  /**
   * Find budget items by budget ID with pagination
   * @param budgetId - Budget's unique identifier
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Promise resolving to paginated budget items
   */
  async findByBudgetIdPaginated(
    budgetId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<BudgetItem>> {
    try {
      return await this.findPaginated({ budgetId }, page, limit)
    } catch (error) {
      this.logger.error(
        `Error finding budget items by budget ID ${budgetId} with pagination:`,
        error,
      )
      throw error
    }
  }
}

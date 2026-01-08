import { Injectable } from '@nestjs/common'
import {
  Budget as PrismaBudget,
  BudgetItem as PrismaBudgetItem,
  BudgetStatus,
} from '@prisma/client'

import { Budget } from '@domain/budget/entities'
import { BudgetWithItems, IBudgetRepository } from '@domain/budget/interfaces'
import { BasePrismaRepository } from '@infra/database/common'
import { BudgetItemMapper, BudgetMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PaginatedResult } from '@shared'

/**
 * Prisma implementation of the Budget repository
 */
@Injectable()
export class PrismaBudgetRepository
  extends BasePrismaRepository<Budget, PrismaBudget>
  implements IBudgetRepository
{
  /**
   * Constructor for PrismaBudgetRepository
   * @param prisma - The Prisma service dependency
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaBudgetRepository.name)
  }

  protected get modelName(): string {
    return 'budget'
  }

  protected get mapper(): (
    prismaModel: PrismaBudget & { budgetItems?: PrismaBudgetItem[] },
  ) => Budget {
    return BudgetMapper.toDomain
  }

  protected get createMapper(): (entity: Budget) => Record<string, unknown> {
    return BudgetMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: Budget) => Record<string, unknown> {
    return BudgetMapper.toPrismaUpdate
  }

  /**
   * Find budget by service order ID
   * @param serviceOrderId - Service order's unique identifier
   * @returns Promise resolving to the budget or null if not found
   */
  async findByServiceOrderId(serviceOrderId: string): Promise<Budget | null> {
    try {
      return this.findByUniqueField('serviceOrderId', serviceOrderId)
    } catch (error) {
      this.logger.error(`Error finding budget by service order ID ${serviceOrderId}:`, error)
      throw error
    }
  }

  /**
   * Find budgets by client ID with pagination
   * @param clientId - Client's unique identifier
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByClientId(
    clientId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Budget>> {
    try {
      return this.findPaginated({ clientId }, page, limit, { generationDate: 'desc' })
    } catch (error) {
      this.logger.error(`Error finding budgets by client ID ${clientId}:`, error)
      throw error
    }
  }

  /**
   * Find budgets by client name with pagination
   * @param clientName - Client's name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByClientName(
    clientName: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Budget>> {
    try {
      return this.findPaginated(
        {
          client: {
            name: {
              contains: clientName,
              mode: 'insensitive',
            },
          },
        },
        page,
        limit,
        { generationDate: 'desc' },
      )
    } catch (error) {
      this.logger.error(`Error finding budgets by client name "${clientName}":`, error)
      throw error
    }
  }

  /**
   * Find budgets by status with pagination
   * @param status - The status of the budgets to filter by
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByStatus(
    status: BudgetStatus,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Budget>> {
    try {
      return this.findPaginated({ status }, page, limit, { generationDate: 'desc' })
    } catch (error) {
      this.logger.error(`Error finding budgets by status ${status}:`, error)
      throw error
    }
  }

  /**
   * Check if a budget exists for a service order
   * @param serviceOrderId - Service order's unique identifier
   * @returns Promise resolving to true if exists, false otherwise
   */
  async budgetExistsForServiceOrder(serviceOrderId: string): Promise<boolean> {
    try {
      return this.uniqueFieldExists('serviceOrderId', serviceOrderId)
    } catch (error) {
      this.logger.error(`Error checking existence for service order ID ${serviceOrderId}:`, error)
      throw error
    }
  }

  /**
   * Check if a budget exists for a client
   * @param clientId - Client's unique identifier
   * @returns Promise resolving to true if exists, false otherwise
   */
  async budgetExistsForClient(clientId: string): Promise<boolean> {
    try {
      return this.uniqueFieldExists('clientId', clientId)
    } catch (error) {
      this.logger.error(`Error checking existence for client ID ${clientId}:`, error)
      throw error
    }
  }

  /**
   * Find budget by ID, including its items
   * @param id - Budget's unique identifier
   * @returns Promise resolving to the budget with items or null if not found
   */
  async findByIdWithItems(id: string): Promise<BudgetWithItems | null> {
    try {
      const budgetWithItems = await this.prisma.budget.findUnique({
        where: { id },
        include: { budgetItems: true },
      })

      if (!budgetWithItems) {
        return null
      }

      const budget = this.mapper(budgetWithItems)
      const budgetItems = budgetWithItems.budgetItems.map((item) => BudgetItemMapper.toDomain(item))

      return {
        budget,
        budgetItems,
      }
    } catch (error) {
      this.logger.error(`Error finding budget by ID ${id}:`, error)
      throw error
    }
  }
}

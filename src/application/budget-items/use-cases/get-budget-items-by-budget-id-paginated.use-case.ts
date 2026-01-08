import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedBudgetItemsResponseDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { IBudgetItemRepository, BUDGET_ITEM_REPOSITORY } from '@domain/budget-items/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting budget items by budget ID with pagination
 * Handles the orchestration for retrieving budget items filtered by budget ID with pagination
 */
@Injectable()
export class GetBudgetItemsByBudgetIdPaginatedUseCase {
  private readonly logger = new Logger(GetBudgetItemsByBudgetIdPaginatedUseCase.name)

  /**
   * Constructor for GetBudgetItemsByBudgetIdPaginatedUseCase
   * @param budgetItemRepository - Repository for budget item operations
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_ITEM_REPOSITORY) private readonly budgetItemRepository: IBudgetItemRepository,
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute get budget items by budget ID with pagination
   * @param budgetId - Budget ID
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Result with paginated budget items response or error
   */
  async execute(
    budgetId: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedBudgetItemsResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get budget items by budget ID paginated use case', {
        budgetId,
        page,
        limit,
        requestedBy: currentUserId,
        context: 'GetBudgetItemsByBudgetIdPaginatedUseCase.execute',
      })

      const budgetResult = await this.budgetRepository.findById(budgetId)
      if (!budgetResult) {
        const error = new BudgetNotFoundException(budgetId)
        this.logger.warn('Budget not found', {
          budgetId,
          requestedBy: currentUserId,
          context: 'GetBudgetItemsByBudgetIdPaginatedUseCase.execute',
        })
        return new Failure(error)
      }

      const paginatedResult = await this.budgetItemRepository.findByBudgetIdPaginated(
        budgetId,
        page,
        limit,
      )

      const result = {
        data: BudgetItemMapper.toResponseDtoArray(paginatedResult.data),
        meta: paginatedResult.meta,
      }

      this.logger.log('Get budget items by budget ID paginated use case completed successfully', {
        budgetId,
        page,
        limit,
        total: result.meta.total,
        count: result.data.length,
        requestedBy: currentUserId,
        context: 'GetBudgetItemsByBudgetIdPaginatedUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error getting paginated budget items by budget ID', {
        budgetId,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetBudgetItemsByBudgetIdPaginatedUseCase.execute',
      })
      return new Failure(
        error instanceof Error ? error : new Error('Failed to get paginated budget items'),
      )
    }
  }
}

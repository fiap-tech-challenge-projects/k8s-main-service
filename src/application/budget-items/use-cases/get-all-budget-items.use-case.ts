import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedBudgetItemsResponseDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { IBudgetItemRepository, BUDGET_ITEM_REPOSITORY } from '@domain/budget-items/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting all budget items
 * Handles the orchestration for retrieving all budget items with pagination
 */
@Injectable()
export class GetAllBudgetItemsUseCase {
  private readonly logger = new Logger(GetAllBudgetItemsUseCase.name)

  /**
   * Constructor for GetAllBudgetItemsUseCase
   * @param budgetItemRepository - Repository for budget item operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_ITEM_REPOSITORY) private readonly budgetItemRepository: IBudgetItemRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute get all budget items
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Result with paginated budget items response or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedBudgetItemsResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get all budget items use case', {
        page,
        limit,
        requestedBy: currentUserId,
        context: 'GetAllBudgetItemsUseCase.execute',
      })

      const paginatedResult = await this.budgetItemRepository.findAll(page, limit)
      const result = {
        data: BudgetItemMapper.toResponseDtoArray(paginatedResult.data),
        meta: paginatedResult.meta,
      }

      this.logger.log('Get all budget items use case completed successfully', {
        count: result.data.length,
        total: result.meta.total,
        requestedBy: currentUserId,
        context: 'GetAllBudgetItemsUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error getting all budget items', {
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetAllBudgetItemsUseCase.execute',
      })
      return new Failure(
        error instanceof Error ? error : new Error('Failed to get all budget items'),
      )
    }
  }
}

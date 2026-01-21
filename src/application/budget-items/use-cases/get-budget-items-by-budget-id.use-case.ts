import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetItemResponseDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { IBudgetItemRepository, BUDGET_ITEM_REPOSITORY } from '@domain/budget-items/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting budget items by budget ID
 * Handles the orchestration for retrieving budget items filtered by budget ID
 */
@Injectable()
export class GetBudgetItemsByBudgetIdUseCase {
  private readonly logger = new Logger(GetBudgetItemsByBudgetIdUseCase.name)

  /**
   * Constructor for GetBudgetItemsByBudgetIdUseCase
   * @param budgetItemRepository - Repository for budget item operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_ITEM_REPOSITORY) private readonly budgetItemRepository: IBudgetItemRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute get budget items by budget ID
   * @param budgetId - Budget ID
   * @returns Result with budget items array or error
   */
  async execute(budgetId: string): Promise<Result<BudgetItemResponseDto[], Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get budget items by budget ID use case', {
        budgetId,
        requestedBy: currentUserId,
        context: 'GetBudgetItemsByBudgetIdUseCase.execute',
      })

      const budgetItems = await this.budgetItemRepository.findByBudgetId(budgetId)
      const result = budgetItems.map((item) => BudgetItemMapper.toResponseDto(item))

      this.logger.log('Get budget items by budget ID use case completed successfully', {
        budgetId,
        count: result.length,
        requestedBy: currentUserId,
        context: 'GetBudgetItemsByBudgetIdUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error getting budget items by budget ID', {
        budgetId,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetBudgetItemsByBudgetIdUseCase.execute',
      })
      return new Failure(
        error instanceof Error ? error : new Error('Failed to get budget items by budget ID'),
      )
    }
  }
}

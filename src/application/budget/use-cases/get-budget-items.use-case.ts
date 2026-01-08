import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetItemResponseDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { IBudgetItemRepository, BUDGET_ITEM_REPOSITORY } from '@domain/budget-items/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting budget items by budget ID
 * Handles the orchestration for finding items associated with a budget
 */
@Injectable()
export class GetBudgetItemsUseCase {
  private readonly logger = new Logger(GetBudgetItemsUseCase.name)

  /**
   * Constructor for GetBudgetItemsUseCase
   * @param budgetItemRepository - Repository for budget item operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_ITEM_REPOSITORY) private readonly budgetItemRepository: IBudgetItemRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute get budget items
   * @param budgetId - Budget ID
   * @returns Result with array of budget item responses
   */
  async execute(budgetId: string): Promise<Result<BudgetItemResponseDto[], Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get budget items use case', {
        budgetId,
        requestedBy: currentUserId,
        context: 'GetBudgetItemsUseCase.execute',
      })

      const budgetItems = await this.budgetItemRepository.findByBudgetId(budgetId)

      this.logger.log('Get budget items use case completed successfully', {
        budgetId,
        itemCount: budgetItems.length,
        requestedBy: currentUserId,
        context: 'GetBudgetItemsUseCase.execute',
      })

      const mappedItems = budgetItems.map((item) => BudgetItemMapper.toResponseDto(item))
      return new Success(mappedItems)
    } catch (error) {
      this.logger.error('Error getting budget items', {
        budgetId,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetBudgetItemsUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Get budget items failed'),
      )
    }
  }
}

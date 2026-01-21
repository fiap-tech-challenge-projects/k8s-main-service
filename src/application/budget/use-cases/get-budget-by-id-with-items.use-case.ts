import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetWithItemsResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting budget by ID with items
 * Handles the orchestration for retrieving a budget with its items
 */
@Injectable()
export class GetBudgetByIdWithItemsUseCase {
  private readonly logger = new Logger(GetBudgetByIdWithItemsUseCase.name)

  /**
   * Constructor for GetBudgetByIdWithItemsUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute get budget by ID with items
   * @param id - Budget ID
   * @returns Result with budget with items response or error
   */
  async execute(id: string): Promise<Result<BudgetWithItemsResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get budget by ID with items use case', {
        budgetId: id,
        requestedBy: currentUserId,
        context: 'GetBudgetByIdWithItemsUseCase.execute',
      })

      const budgetWithItems = await this.budgetRepository.findByIdWithItems(id)
      if (!budgetWithItems) {
        const error = new BudgetNotFoundException(id)
        this.logger.warn('Budget not found with items', {
          budgetId: id,
          requestedBy: currentUserId,
          context: 'GetBudgetByIdWithItemsUseCase.execute',
        })
        return new Failure(error)
      }

      const responseDto = BudgetMapper.toResponseDtoWithItems(
        budgetWithItems.budget,
        budgetWithItems.budgetItems,
      )

      this.logger.log('Get budget by ID with items use case completed successfully', {
        budgetId: id,
        itemsCount: budgetWithItems.budgetItems?.length ?? 0,
        requestedBy: currentUserId,
        context: 'GetBudgetByIdWithItemsUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting budget by ID with items', {
        budgetId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetBudgetByIdWithItemsUseCase.execute',
      })
      return new Failure(error instanceof DomainException ? error : new BudgetNotFoundException(id))
    }
  }
}

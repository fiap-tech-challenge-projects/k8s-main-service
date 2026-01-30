import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetItemNotFoundException } from '@domain/budget-items/exceptions'
import { IBudgetItemRepository, BUDGET_ITEM_REPOSITORY } from '@domain/budget-items/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for deleting budget item
 * Handles the orchestration for budget item deletion business process
 */
@Injectable()
export class DeleteBudgetItemUseCase {
  private readonly logger = new Logger(DeleteBudgetItemUseCase.name)

  /**
   * Constructor for DeleteBudgetItemUseCase
   * @param budgetItemRepository - Repository for budget item operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_ITEM_REPOSITORY) private readonly budgetItemRepository: IBudgetItemRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget item deletion
   * @param id - Budget item ID
   * @returns Result with boolean or error
   */
  async execute(id: string): Promise<Result<boolean, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing delete budget item use case', {
        budgetItemId: id,
        deletedBy: currentUserId,
        context: 'DeleteBudgetItemUseCase.execute',
      })

      const budgetItem = await this.budgetItemRepository.findById(id)
      if (!budgetItem) {
        const error = new BudgetItemNotFoundException(id)
        this.logger.warn('Budget item not found for deletion', {
          budgetItemId: id,
          deletedBy: currentUserId,
          context: 'DeleteBudgetItemUseCase.execute',
        })
        return new Failure(error)
      }

      await this.budgetItemRepository.delete(id)

      this.logger.log('Budget item deletion use case completed successfully', {
        budgetItemId: id,
        deletedBy: currentUserId,
        context: 'DeleteBudgetItemUseCase.execute',
      })

      return new Success(true)
    } catch (error) {
      this.logger.error('Error deleting budget item', {
        budgetItemId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'DeleteBudgetItemUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Budget item deletion failed'),
      )
    }
  }
}

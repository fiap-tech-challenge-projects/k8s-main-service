import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for deleting budget
 * Handles the orchestration for budget deletion business process
 */
@Injectable()
export class DeleteBudgetUseCase {
  private readonly logger = new Logger(DeleteBudgetUseCase.name)

  /**
   * Constructor for DeleteBudgetUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget deletion
   * @param id - Budget ID
   * @returns Result with void or error
   */
  async execute(id: string): Promise<Result<void, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing delete budget use case', {
        budgetId: id,
        deletedBy: currentUserId,
        context: 'DeleteBudgetUseCase.execute',
      })

      const budget = await this.budgetRepository.findById(id)
      if (!budget) {
        const error = new BudgetNotFoundException(id)
        this.logger.warn('Budget not found for deletion', {
          budgetId: id,
          deletedBy: currentUserId,
          context: 'DeleteBudgetUseCase.execute',
        })
        return new Failure(error)
      }

      await this.budgetRepository.delete(id)

      this.logger.log('Budget deletion use case completed successfully', {
        budgetId: id,
        deletedBy: currentUserId,
        context: 'DeleteBudgetUseCase.execute',
      })

      return new Success(undefined)
    } catch (error) {
      this.logger.error('Error deleting budget', {
        budgetId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'DeleteBudgetUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Budget deletion failed'),
      )
    }
  }
}

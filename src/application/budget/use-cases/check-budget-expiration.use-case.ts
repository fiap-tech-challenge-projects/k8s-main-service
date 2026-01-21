import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for checking budget expiration
 * Handles the orchestration for checking if a budget is expired
 */
@Injectable()
export class CheckBudgetExpirationUseCase {
  private readonly logger = new Logger(CheckBudgetExpirationUseCase.name)

  /**
   * Constructor for CheckBudgetExpirationUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute check budget expiration
   * @param id - Budget ID
   * @returns Result with boolean indicating if budget is expired or error
   */
  async execute(id: string): Promise<Result<boolean, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing check budget expiration use case', {
        budgetId: id,
        checkedBy: currentUserId,
        context: 'CheckBudgetExpirationUseCase.execute',
      })

      const budget = await this.budgetRepository.findById(id)
      if (!budget) {
        const error = new BudgetNotFoundException(id)
        this.logger.warn('Budget not found for expiration check', {
          budgetId: id,
          checkedBy: currentUserId,
          context: 'CheckBudgetExpirationUseCase.execute',
        })
        return new Failure(error)
      }

      const isExpired = budget.isExpired()

      this.logger.log('Check budget expiration use case completed successfully', {
        budgetId: id,
        isExpired,
        checkedBy: currentUserId,
        context: 'CheckBudgetExpirationUseCase.execute',
      })

      return new Success(isExpired)
    } catch (error) {
      this.logger.error('Error checking budget expiration', {
        budgetId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'CheckBudgetExpirationUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Budget expiration check failed'),
      )
    }
  }
}

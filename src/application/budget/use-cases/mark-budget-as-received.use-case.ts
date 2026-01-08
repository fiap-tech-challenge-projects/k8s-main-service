import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { BudgetStatusChangeValidator } from '@domain/budget/validators'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for marking budget as received
 * Handles the orchestration for marking a budget as received by client
 */
@Injectable()
export class MarkBudgetAsReceivedUseCase {
  private readonly logger = new Logger(MarkBudgetAsReceivedUseCase.name)

  /**
   * Constructor for MarkBudgetAsReceivedUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute mark budget as received
   * @param id - Budget ID
   * @returns Result with budget response or error
   */
  async execute(id: string): Promise<Result<BudgetResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing mark budget as received use case', {
        budgetId: id,
        markedBy: currentUserId,
        context: 'MarkBudgetAsReceivedUseCase.execute',
      })

      const budget = await this.budgetRepository.findById(id)
      if (!budget) {
        const error = new BudgetNotFoundException(id)
        this.logger.warn('Budget not found for marking as received', {
          budgetId: id,
          markedBy: currentUserId,
          context: 'MarkBudgetAsReceivedUseCase.execute',
        })
        return new Failure(error)
      }

      BudgetStatusChangeValidator.validateCanMarkAsReceived(budget.status, budget.id)

      budget.markAsReceived()
      const saved = await this.budgetRepository.update(id, budget)

      this.logger.log('Mark budget as received use case completed successfully', {
        budgetId: id,
        status: saved.status,
        markedBy: currentUserId,
        context: 'MarkBudgetAsReceivedUseCase.execute',
      })

      const responseDto = BudgetMapper.toResponseDto(saved)
      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error marking budget as received', {
        budgetId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'MarkBudgetAsReceivedUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Mark budget as received failed'),
      )
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { BudgetEventEmitterService } from '@application/events/budget-event-emitter.service'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { BudgetStatusChangeValidator } from '@domain/budget/validators'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for rejecting a budget
 * Handles the orchestration for budget rejection business process
 */
@Injectable()
export class RejectBudgetUseCase {
  private readonly logger = new Logger(RejectBudgetUseCase.name)

  /**
   * Constructor for RejectBudgetUseCase
   * @param budgetRepository - Repository for budget operations
   * @param budgetEventEmitterService - Service for emitting budget events
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly budgetEventEmitterService: BudgetEventEmitterService,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget rejection
   * @param id - Budget ID to reject
   * @param reason - Optional rejection reason
   * @returns Result with budget response DTO or error
   */
  async execute(id: string, reason?: string): Promise<Result<BudgetResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing reject budget use case', {
        budgetId: id,
        reason,
        rejectedBy: currentUserId,
        context: 'RejectBudgetUseCase.execute',
      })

      const budget = await this.budgetRepository.findById(id)
      if (!budget) {
        const error = new BudgetNotFoundException(id)
        this.logger.warn('Budget not found for rejection', {
          budgetId: id,
          rejectedBy: currentUserId,
          context: 'RejectBudgetUseCase.execute',
        })
        return new Failure(error)
      }

      BudgetStatusChangeValidator.validateRejection(
        budget.status,
        budget.id,
        budget.isExpired(),
        budget.getExpirationDate(),
      )

      budget.reject()
      const saved = await this.budgetRepository.update(id, budget)

      await this.budgetEventEmitterService.emitBudgetRejectedEvent(saved, reason)

      this.logger.log('Reject budget use case completed successfully', {
        budgetId: id,
        reason,
        rejectedBy: currentUserId,
        context: 'RejectBudgetUseCase.execute',
      })

      const responseDto = BudgetMapper.toResponseDto(saved)
      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error rejecting budget', {
        budgetId: id,
        reason,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'RejectBudgetUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Budget rejection failed'),
      )
    }
  }
}

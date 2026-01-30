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
 * Use case for sending budget
 * Handles the orchestration for sending a budget to client
 */
@Injectable()
export class SendBudgetUseCase {
  private readonly logger = new Logger(SendBudgetUseCase.name)

  /**
   * Constructor for SendBudgetUseCase
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
   * Execute send budget
   * @param id - Budget ID
   * @returns Result with budget response or error
   */
  async execute(id: string): Promise<Result<BudgetResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing send budget use case', {
        budgetId: id,
        sentBy: currentUserId,
        context: 'SendBudgetUseCase.execute',
      })

      const budget = await this.budgetRepository.findById(id)
      if (!budget) {
        const error = new BudgetNotFoundException(id)
        this.logger.warn('Budget not found for sending', {
          budgetId: id,
          sentBy: currentUserId,
          context: 'SendBudgetUseCase.execute',
        })
        return new Failure(error)
      }

      BudgetStatusChangeValidator.validateCanSend(budget.status, budget.id)
      budget.send()
      const saved = await this.budgetRepository.update(id, budget)

      await this.budgetEventEmitterService.emitBudgetSentEvent(saved)

      this.logger.log('Send budget use case completed successfully', {
        budgetId: id,
        status: saved.status,
        sentBy: currentUserId,
        context: 'SendBudgetUseCase.execute',
      })

      const responseDto = BudgetMapper.toResponseDto(saved)
      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error sending budget', {
        budgetId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'SendBudgetUseCase.execute',
      })
      return new Failure(error instanceof DomainException ? error : new Error('Budget send failed'))
    }
  }
}

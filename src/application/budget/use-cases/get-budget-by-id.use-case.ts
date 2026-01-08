import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting a budget by ID
 * Handles the orchestration for budget retrieval business process
 */
@Injectable()
export class GetBudgetByIdUseCase {
  private readonly logger = new Logger(GetBudgetByIdUseCase.name)

  /**
   * Constructor for GetBudgetByIdUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget retrieval by ID
   * @param id - Budget ID
   * @returns Result with budget response DTO or error
   */
  async execute(id: string): Promise<Result<BudgetResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get budget by ID use case', {
        budgetId: id,
        requestedBy: currentUserId,
        context: 'GetBudgetByIdUseCase.execute',
      })

      const budget = await this.budgetRepository.findById(id)
      if (!budget) {
        const error = new BudgetNotFoundException(id)
        this.logger.warn('Budget not found', {
          budgetId: id,
          requestedBy: currentUserId,
          context: 'GetBudgetByIdUseCase.execute',
        })
        return new Failure(error)
      }

      this.logger.log('Get budget by ID use case completed successfully', {
        budgetId: id,
        requestedBy: currentUserId,
        context: 'GetBudgetByIdUseCase.execute',
      })

      const responseDto = BudgetMapper.toResponseDto(budget)
      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting budget by ID', {
        budgetId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetBudgetByIdUseCase.execute',
      })
      return new Failure(error instanceof DomainException ? error : new BudgetNotFoundException(id))
    }
  }
}

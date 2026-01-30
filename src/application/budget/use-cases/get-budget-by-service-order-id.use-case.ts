import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting budget by service order ID
 * Handles the orchestration for finding a budget by its associated service order
 */
@Injectable()
export class GetBudgetByServiceOrderIdUseCase {
  private readonly logger = new Logger(GetBudgetByServiceOrderIdUseCase.name)

  /**
   * Constructor for GetBudgetByServiceOrderIdUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute get budget by service order ID
   * @param serviceOrderId - Service Order ID
   * @returns Result with budget response or null if not found
   */
  async execute(serviceOrderId: string): Promise<Result<BudgetResponseDto | null, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get budget by service order ID use case', {
        serviceOrderId,
        requestedBy: currentUserId,
        context: 'GetBudgetByServiceOrderIdUseCase.execute',
      })

      const budget = await this.budgetRepository.findByServiceOrderId(serviceOrderId)

      if (!budget) {
        this.logger.log('Budget not found for service order', {
          serviceOrderId,
          requestedBy: currentUserId,
          context: 'GetBudgetByServiceOrderIdUseCase.execute',
        })
        return new Success(null)
      }

      this.logger.log('Get budget by service order ID use case completed successfully', {
        serviceOrderId,
        budgetId: budget.id,
        requestedBy: currentUserId,
        context: 'GetBudgetByServiceOrderIdUseCase.execute',
      })

      const responseDto = BudgetMapper.toResponseDto(budget)
      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting budget by service order ID', {
        serviceOrderId,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetBudgetByServiceOrderIdUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException
          ? error
          : new Error('Get budget by service order ID failed'),
      )
    }
  }
}

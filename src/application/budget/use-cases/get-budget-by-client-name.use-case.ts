import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedBudgetsResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting budgets by client name
 * Handles the orchestration for retrieving budgets filtered by client name
 */
@Injectable()
export class GetBudgetByClientNameUseCase {
  private readonly logger = new Logger(GetBudgetByClientNameUseCase.name)

  /**
   * Constructor for GetBudgetByClientNameUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute get budgets by client name
   * @param clientName - Client name to filter budgets
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Result with paginated budgets response or error
   */
  async execute(
    clientName: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedBudgetsResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get budgets by client name use case', {
        clientName,
        page,
        limit,
        requestedBy: currentUserId,
        context: 'GetBudgetByClientNameUseCase.execute',
      })

      const paginatedResult = await this.budgetRepository.findByClientName(clientName, page, limit)
      const result = {
        data: BudgetMapper.toResponseDtoArray(paginatedResult.data),
        meta: paginatedResult.meta,
      }

      this.logger.log('Get budgets by client name use case completed successfully', {
        clientName,
        count: result.data.length,
        total: result.meta.total,
        requestedBy: currentUserId,
        context: 'GetBudgetByClientNameUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error getting budgets by client name', {
        clientName,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetBudgetByClientNameUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException ? error : new Error('Get budgets by client name failed'),
      )
    }
  }
}

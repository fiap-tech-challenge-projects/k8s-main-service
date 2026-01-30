import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedBudgetsResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting budgets by client ID
 * Handles the orchestration for budget retrieval by client business process
 */
@Injectable()
export class GetBudgetsByClientIdUseCase {
  private readonly logger = new Logger(GetBudgetsByClientIdUseCase.name)

  /**
   * Constructor for GetBudgetsByClientIdUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget retrieval by client ID
   * @param clientId - Client ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Result with paginated budgets response DTO or error
   */
  async execute(
    clientId: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedBudgetsResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get budgets by client ID use case', {
        clientId,
        page,
        limit,
        requestedBy: currentUserId,
        context: 'GetBudgetsByClientIdUseCase.execute',
      })

      const paginatedResult = await this.budgetRepository.findByClientId(clientId, page, limit)

      this.logger.log('Get budgets by client ID use case completed successfully', {
        clientId,
        totalRecords: paginatedResult.meta.total,
        currentPage: paginatedResult.meta.page,
        requestedBy: currentUserId,
        context: 'GetBudgetsByClientIdUseCase.execute',
      })

      const response: PaginatedBudgetsResponseDto = {
        data: BudgetMapper.toResponseDtoArray(paginatedResult.data),
        meta: paginatedResult.meta,
      }

      return new Success(response)
    } catch (error) {
      this.logger.error('Error getting budgets by client ID', {
        clientId,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetBudgetsByClientIdUseCase.execute',
      })
      return new Failure(
        error instanceof Error ? error : new Error('Get budgets by client ID failed'),
      )
    }
  }
}

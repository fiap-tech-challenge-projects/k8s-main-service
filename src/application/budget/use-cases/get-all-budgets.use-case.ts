import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedBudgetsResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting all budgets with pagination
 * Handles the orchestration for budget listing business process
 */
@Injectable()
export class GetAllBudgetsUseCase {
  private readonly logger = new Logger(GetAllBudgetsUseCase.name)

  /**
   * Constructor for GetAllBudgetsUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget listing
   * @param page - Page number for pagination
   * @param limit - Items per page for pagination
   * @returns Result with paginated budgets response DTO or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedBudgetsResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get all budgets use case', {
        page,
        limit,
        requestedBy: currentUserId,
        context: 'GetAllBudgetsUseCase.execute',
      })

      const paginatedResult = await this.budgetRepository.findAll(page, limit)
      const result = {
        data: BudgetMapper.toResponseDtoArray(paginatedResult.data),
        meta: paginatedResult.meta,
      }

      this.logger.log('Get all budgets use case completed successfully', {
        page,
        limit,
        resultCount: result.data.length,
        requestedBy: currentUserId,
        context: 'GetAllBudgetsUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error getting all budgets', {
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetAllBudgetsUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Get all budgets failed'),
      )
    }
  }
}

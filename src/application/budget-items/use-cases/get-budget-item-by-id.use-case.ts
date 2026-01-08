import { Injectable, Logger, Inject } from '@nestjs/common'

import { BudgetItemResponseDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { BudgetItemNotFoundException } from '@domain/budget-items/exceptions'
import { IBudgetItemRepository, BUDGET_ITEM_REPOSITORY } from '@domain/budget-items/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting budget item by ID
 * Handles the orchestration for budget item retrieval business process
 */
@Injectable()
export class GetBudgetItemByIdUseCase {
  private readonly logger = new Logger(GetBudgetItemByIdUseCase.name)

  /**
   * Constructor for GetBudgetItemByIdUseCase
   * @param budgetItemRepository - Repository for budget item operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_ITEM_REPOSITORY) private readonly budgetItemRepository: IBudgetItemRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget item retrieval by ID
   * @param id - Budget item ID
   * @returns Result with budget item response DTO or error
   */
  async execute(id: string): Promise<Result<BudgetItemResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()
      const currentUserRole = this.userContextService.getUserRole()

      this.logger.log('Executing get budget item by ID use case', {
        budgetItemId: id,
        requestedBy: currentUserId,
        requestedByRole: currentUserRole,
        context: 'GetBudgetItemByIdUseCase.execute',
      })

      const budgetItem = await this.budgetItemRepository.findById(id)
      if (!budgetItem) {
        const error = new BudgetItemNotFoundException(id)
        this.logger.warn('Budget item not found', {
          budgetItemId: id,
          requestedBy: currentUserId,
          context: 'GetBudgetItemByIdUseCase.execute',
        })
        return new Failure(error)
      }

      this.logger.log('Get budget item by ID use case completed successfully', {
        budgetItemId: id,
        requestedBy: currentUserId,
        context: 'GetBudgetItemByIdUseCase.execute',
      })

      const responseDto = BudgetItemMapper.toResponseDto(budgetItem)
      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting budget item by ID', {
        budgetItemId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetBudgetItemByIdUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new BudgetItemNotFoundException(id),
      )
    }
  }
}

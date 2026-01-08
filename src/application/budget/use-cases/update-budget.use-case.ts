import { Injectable, Logger, Inject } from '@nestjs/common'

import { UpdateBudgetDto, BudgetResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for updating budget
 * Handles the orchestration for budget update business process
 */
@Injectable()
export class UpdateBudgetUseCase {
  private readonly logger = new Logger(UpdateBudgetUseCase.name)

  /**
   * Constructor for UpdateBudgetUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget update
   * @param id - Budget ID
   * @param updateBudgetDto - Budget update data
   * @returns Result with budget response DTO or error
   */
  async execute(
    id: string,
    updateBudgetDto: UpdateBudgetDto,
  ): Promise<Result<BudgetResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing update budget use case', {
        budgetId: id,
        updatedBy: currentUserId,
        context: 'UpdateBudgetUseCase.execute',
      })

      const existingBudget = await this.budgetRepository.findById(id)
      if (!existingBudget) {
        const error = new BudgetNotFoundException(id)
        this.logger.warn('Budget not found for update', {
          budgetId: id,
          updatedBy: currentUserId,
          context: 'UpdateBudgetUseCase.execute',
        })
        return new Failure(error)
      }

      BudgetMapper.fromUpdateDto(updateBudgetDto, existingBudget)
      const savedBudget = await this.budgetRepository.update(id, existingBudget)

      this.logger.log('Budget update use case completed successfully', {
        budgetId: id,
        status: savedBudget.status,
        updatedBy: currentUserId,
        context: 'UpdateBudgetUseCase.execute',
      })

      const responseDto = BudgetMapper.toResponseDto(savedBudget)
      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error updating budget', {
        budgetId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'UpdateBudgetUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Budget update failed'),
      )
    }
  }
}

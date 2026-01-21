import { Injectable, Logger, Inject } from '@nestjs/common'

import { UpdateBudgetItemDto, BudgetItemResponseDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { BudgetItemNotFoundException } from '@domain/budget-items/exceptions'
import { IBudgetItemRepository, BUDGET_ITEM_REPOSITORY } from '@domain/budget-items/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for updating budget item
 * Handles the orchestration for budget item update business process
 */
@Injectable()
export class UpdateBudgetItemUseCase {
  private readonly logger = new Logger(UpdateBudgetItemUseCase.name)

  /**
   * Constructor for UpdateBudgetItemUseCase
   * @param budgetItemRepository - Repository for budget item operations
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_ITEM_REPOSITORY) private readonly budgetItemRepository: IBudgetItemRepository,
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget item update
   * @param id - Budget item ID
   * @param updateBudgetItemDto - Budget item update data
   * @returns Result with budget item response DTO or error
   */
  async execute(
    id: string,
    updateBudgetItemDto: UpdateBudgetItemDto,
  ): Promise<Result<BudgetItemResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing update budget item use case', {
        budgetItemId: id,
        requestedBy: currentUserId,
        context: 'UpdateBudgetItemUseCase.execute',
      })

      const existingBudgetItem = await this.budgetItemRepository.findById(id)
      if (!existingBudgetItem) {
        const error = new BudgetItemNotFoundException(id)
        this.logger.warn('Budget item not found for update', {
          budgetItemId: id,
          requestedBy: currentUserId,
          context: 'UpdateBudgetItemUseCase.execute',
        })
        return new Failure(error)
      }

      // Update the entity through the mapper (modifies the existing entity)
      BudgetItemMapper.fromUpdateDto(updateBudgetItemDto, existingBudgetItem)

      // Save the updated entity
      const savedBudgetItem = await this.budgetItemRepository.update(id, existingBudgetItem)

      // Recalculate budget total amount
      const budgetWithItems = await this.budgetRepository.findByIdWithItems(
        existingBudgetItem.budgetId,
      )
      if (budgetWithItems) {
        const updatedBudget = budgetWithItems.budget.recalculateTotalAmount(
          budgetWithItems.budgetItems,
        )
        await this.budgetRepository.update(existingBudgetItem.budgetId, updatedBudget)
        this.logger.log('Budget total amount recalculated successfully after update', {
          budgetId: existingBudgetItem.budgetId,
          newTotalAmount: updatedBudget.totalAmount.value,
          requestedBy: currentUserId,
          context: 'UpdateBudgetItemUseCase.execute',
        })
      } else {
        this.logger.warn(
          'Failed to recalculate budget total amount after update - budget with items not found',
          {
            budgetId: existingBudgetItem.budgetId,
            requestedBy: currentUserId,
            context: 'UpdateBudgetItemUseCase.execute',
          },
        )
      }

      const responseDto = BudgetItemMapper.toResponseDto(savedBudgetItem)

      this.logger.log('Budget item update use case completed successfully', {
        budgetItemId: id,
        requestedBy: currentUserId,
        context: 'UpdateBudgetItemUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error updating budget item', {
        budgetItemId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'UpdateBudgetItemUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new BudgetItemNotFoundException(id),
      )
    }
  }
}

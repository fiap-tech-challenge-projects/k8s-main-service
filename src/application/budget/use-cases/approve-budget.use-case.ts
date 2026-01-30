import { Injectable, Logger, Inject } from '@nestjs/common'
import { BudgetItemType } from '@prisma/client'

import { BudgetResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { BudgetItemResponseDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { BudgetEventEmitterService } from '@application/events/budget-event-emitter.service'
import { CheckStockAvailabilityUseCase } from '@application/stock/use-cases'
import {
  BudgetNotFoundException,
  BudgetInsufficientStockException,
} from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { BudgetStatusChangeValidator } from '@domain/budget/validators'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for approving a budget
 * Handles the orchestration for budget approval business process
 */
@Injectable()
export class ApproveBudgetUseCase {
  private readonly logger = new Logger(ApproveBudgetUseCase.name)

  /**
   * Constructor for ApproveBudgetUseCase
   * @param budgetRepository - Repository for budget operations
   * @param checkStockAvailabilityUseCase - Use case for checking stock availability
   * @param budgetEventEmitterService - Service for emitting budget events
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly checkStockAvailabilityUseCase: CheckStockAvailabilityUseCase,
    private readonly budgetEventEmitterService: BudgetEventEmitterService,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget approval
   * @param id - Budget ID to approve
   * @returns Result with budget response DTO or error
   */
  async execute(id: string): Promise<Result<BudgetResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing approve budget use case', {
        budgetId: id,
        approvedBy: currentUserId,
        context: 'ApproveBudgetUseCase.execute',
      })

      const budget = await this.budgetRepository.findById(id)
      if (!budget) {
        const error = new BudgetNotFoundException(id)
        this.logger.warn('Budget not found for approval', {
          budgetId: id,
          context: 'ApproveBudgetUseCase.execute',
        })
        return new Failure(error)
      }

      BudgetStatusChangeValidator.validateApproval(
        budget.status,
        budget.id,
        budget.isExpired(),
        budget.getExpirationDate(),
      )

      // Validate stock availability before approval
      await this.validateStockAvailability(budget.id)

      budget.approve()
      const saved = await this.budgetRepository.update(id, budget)

      await this.budgetEventEmitterService.emitBudgetApprovedEvent(saved)

      this.logger.log('Approve budget use case completed successfully', {
        budgetId: id,
        approvedBy: currentUserId,
        context: 'ApproveBudgetUseCase.execute',
      })

      const responseDto = BudgetMapper.toResponseDto(saved)
      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error approving budget', {
        budgetId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'ApproveBudgetUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Budget approval failed'),
      )
    }
  }

  /**
   * Validates stock availability for all stock items in the budget
   * @param budgetId - Budget's unique identifier
   * @throws BudgetInsufficientStockException if any stock item has insufficient quantity
   */
  private async validateStockAvailability(budgetId: string): Promise<void> {
    try {
      const budgetItems = await this.getBudgetItems(budgetId)
      const stockItems = budgetItems.filter((item) => item.type === BudgetItemType.STOCK_ITEM)

      for (const item of stockItems) {
        if (item.stockItemId) {
          const hasStockResult = await this.checkStockAvailabilityUseCase.execute(
            item.stockItemId,
            item.quantity,
          )
          const hasStock = hasStockResult.isSuccess && hasStockResult.value
          if (!hasStock) {
            throw new BudgetInsufficientStockException(budgetId, item.stockItemId, item.quantity, 0)
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error validating stock availability for budget ${budgetId}:`, error)
      throw error
    }
  }

  /**
   * Get budget items by budget ID
   * @param budgetId Budget identifier
   * @returns Array of BudgetItemResponseDto
   */
  private async getBudgetItems(budgetId: string): Promise<BudgetItemResponseDto[]> {
    try {
      const budgetWithItems = await this.budgetRepository.findByIdWithItems(budgetId)
      if (!budgetWithItems) {
        throw new BudgetNotFoundException(budgetId)
      }
      return BudgetItemMapper.toResponseDtoArray(budgetWithItems.budgetItems)
    } catch (error) {
      this.logger.error(`Error getting budget items for budget ${budgetId}:`, error)
      throw error
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { CreateBudgetItemDto, BudgetItemResponseDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { IBudgetItemRepository, BUDGET_ITEM_REPOSITORY } from '@domain/budget-items/interfaces'
import { BudgetItemCreationValidator } from '@domain/budget-items/validators'
import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for creating a new budget item
 * Handles the orchestration for budget item creation business process
 */
@Injectable()
export class CreateBudgetItemUseCase {
  private readonly logger = new Logger(CreateBudgetItemUseCase.name)

  /**
   * Constructor for CreateBudgetItemUseCase
   * @param budgetItemRepository - Repository for budget item operations
   * @param budgetRepository - Repository for budget operations
   * @param serviceOrderRepository - Repository for service order operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_ITEM_REPOSITORY) private readonly budgetItemRepository: IBudgetItemRepository,
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget item creation
   * @param createBudgetItemDto - Budget item creation data
   * @returns Result with budget item response DTO or error
   */
  async execute(
    createBudgetItemDto: CreateBudgetItemDto,
  ): Promise<Result<BudgetItemResponseDto, DomainException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing create budget item use case', {
        budgetId: createBudgetItemDto.budgetId,
        type: createBudgetItemDto.type,
        requestedBy: currentUserId,
        context: 'CreateBudgetItemUseCase.execute',
      })

      // Get the budget to find the service order ID
      const budget = await this.budgetRepository.findById(createBudgetItemDto.budgetId)
      if (!budget) {
        const error = new BudgetNotFoundException(createBudgetItemDto.budgetId)
        this.logger.warn('Budget not found', {
          budgetId: createBudgetItemDto.budgetId,
          requestedBy: currentUserId,
          context: 'CreateBudgetItemUseCase.execute',
        })
        return new Failure(error)
      }

      // Get the service order to check its status
      const serviceOrder = await this.serviceOrderRepository.findById(budget.serviceOrderId)
      if (!serviceOrder) {
        const error = new ServiceOrderNotFoundException(budget.serviceOrderId)
        this.logger.warn('Service order not found', {
          serviceOrderId: budget.serviceOrderId,
          budgetId: createBudgetItemDto.budgetId,
          requestedBy: currentUserId,
          context: 'CreateBudgetItemUseCase.execute',
        })
        return new Failure(error)
      }

      // Validate that the service order is in IN_DIAGNOSIS status
      BudgetItemCreationValidator.validateCanAddBudgetItems(
        serviceOrder.status,
        budget.serviceOrderId,
      )

      const budgetItem = BudgetItemMapper.fromCreateDto(createBudgetItemDto)
      const savedBudgetItem = await this.budgetItemRepository.create(budgetItem)

      // Recalculate budget total amount
      const budgetWithItems = await this.budgetRepository.findByIdWithItems(
        createBudgetItemDto.budgetId,
      )
      if (budgetWithItems) {
        const updatedBudget = budgetWithItems.budget.recalculateTotalAmount(
          budgetWithItems.budgetItems,
        )
        await this.budgetRepository.update(createBudgetItemDto.budgetId, updatedBudget)
        this.logger.log('Budget total amount recalculated successfully', {
          budgetId: createBudgetItemDto.budgetId,
          newTotalAmount: updatedBudget.totalAmount.value,
          requestedBy: currentUserId,
          context: 'CreateBudgetItemUseCase.execute',
        })
      } else {
        this.logger.warn(
          'Failed to recalculate budget total amount - budget with items not found',
          {
            budgetId: createBudgetItemDto.budgetId,
            requestedBy: currentUserId,
            context: 'CreateBudgetItemUseCase.execute',
          },
        )
      }

      const responseDto = BudgetItemMapper.toResponseDto(savedBudgetItem)

      this.logger.log('Budget item creation use case completed successfully', {
        budgetItemId: responseDto.id,
        budgetId: responseDto.budgetId,
        type: responseDto.type,
        requestedBy: currentUserId,
        context: 'CreateBudgetItemUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error creating budget item', {
        budgetId: createBudgetItemDto.budgetId,
        type: createBudgetItemDto.type,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'CreateBudgetItemUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Failed to create budget item'),
      )
    }
  }
}

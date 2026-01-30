import { Injectable, Logger, Inject } from '@nestjs/common'

import { CreateBudgetDto, BudgetResponseDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { IBudgetRepository, BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for creating a new budget
 * Handles the orchestration for budget creation business process
 */
@Injectable()
export class CreateBudgetUseCase {
  private readonly logger = new Logger(CreateBudgetUseCase.name)

  /**
   * Constructor for CreateBudgetUseCase
   * @param budgetRepository - Repository for budget operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute budget creation
   * @param createBudgetDto - Budget creation data
   * @returns Result with budget response DTO or error
   */
  async execute(createBudgetDto: CreateBudgetDto): Promise<Result<BudgetResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing create budget use case', {
        serviceOrderId: createBudgetDto.serviceOrderId,
        createdBy: currentUserId,
        context: 'CreateBudgetUseCase.execute',
      })

      const budget = BudgetMapper.fromCreateDto(createBudgetDto)
      const savedBudget = await this.budgetRepository.create(budget)

      this.logger.log('Budget creation use case completed successfully', {
        budgetId: savedBudget.id,
        serviceOrderId: savedBudget.serviceOrderId,
        status: savedBudget.status,
        createdBy: currentUserId,
        context: 'CreateBudgetUseCase.execute',
      })

      const responseDto = BudgetMapper.toResponseDto(savedBudget)
      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error creating budget', {
        serviceOrderId: createBudgetDto.serviceOrderId,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'CreateBudgetUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Budget creation failed'),
      )
    }
  }
}

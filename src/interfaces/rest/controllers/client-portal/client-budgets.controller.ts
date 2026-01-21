import { Controller, Get, Param, Query, Logger, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

import { BudgetWithItemsResponseDto, PaginatedBudgetsResponseDto } from '@application/budget/dto'
import { BudgetPresenter } from '@application/budget/presenters'
import {
  GetBudgetsByClientIdUseCase,
  GetBudgetByIdWithItemsUseCase,
  ApproveBudgetUseCase,
  RejectBudgetUseCase,
  CheckBudgetExpirationUseCase,
} from '@application/budget/use-cases'
import { PaginatedBudgetItemsResponseDto } from '@application/budget-items/dto'
import { GetBudgetItemsByBudgetIdPaginatedUseCase } from '@application/budget-items/use-cases'
import { paginationQuery, Roles, ClientAccess } from '@shared/decorators'
import { PaginationQueryDto } from '@shared/dto'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * Client Portal Budget Controller
 * Provides endpoints for clients to view and interact with their budgets
 */
@ApiTags('Client Portal - Budgets')
@Controller('client-portal/budgets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientBudgetsController {
  private readonly logger = new Logger(ClientBudgetsController.name)

  /**
   * Creates a new instance of ClientBudgetsController
   * @param getBudgetsByClientIdUseCase - Use case for getting budgets by client ID
   * @param getBudgetByIdWithItemsUseCase - Use case for getting budget by ID with items
   * @param approveBudgetUseCase - Use case for approving budgets
   * @param rejectBudgetUseCase - Use case for rejecting budgets
   * @param checkBudgetExpirationUseCase - Use case for checking budget expiration
   * @param getBudgetItemsByBudgetIdPaginatedUseCase - Use case for getting budget items by budget ID paginated
   * @param budgetPresenter - Presenter for budget response formatting
   */
  constructor(
    private readonly getBudgetsByClientIdUseCase: GetBudgetsByClientIdUseCase,
    private readonly getBudgetByIdWithItemsUseCase: GetBudgetByIdWithItemsUseCase,
    private readonly approveBudgetUseCase: ApproveBudgetUseCase,
    private readonly rejectBudgetUseCase: RejectBudgetUseCase,
    private readonly checkBudgetExpirationUseCase: CheckBudgetExpirationUseCase,
    private readonly getBudgetItemsByBudgetIdPaginatedUseCase: GetBudgetItemsByBudgetIdPaginatedUseCase,
    private readonly budgetPresenter: BudgetPresenter,
  ) {}

  /**
   * Get all budgets for a specific client
   * @param clientId - Client identifier (validated by ClientAccess decorator)
   * @param pagination - Pagination parameters
   * @returns Paginated list of budgets
   */
  @Get('client/:clientId')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all budgets for a client',
    description: 'Retrieve all budgets associated with a specific client',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'Client ID' })
  @paginationQuery()
  @ApiResponse({
    status: 200,
    description: 'Budgets retrieved successfully',
    type: PaginatedBudgetsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - can only access own data',
  })
  async getBudgetsByClient(
    @ClientAccess() clientId: string,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedBudgetsResponseDto> {
    try {
      this.logger.log(`Getting budgets for client ${clientId}`)
      const result = await this.getBudgetsByClientIdUseCase.execute(
        clientId,
        pagination.page,
        pagination.limit,
      )

      if (result.isSuccess) {
        return result.value
      }

      throw result.error
    } catch (error) {
      this.logger.error(`Error getting budgets for client ${clientId}:`, error)
      throw error
    }
  }

  /**
   * Get a specific budget with its items for a client
   * @param clientId - Client identifier (validated by ClientAccess decorator)
   * @param budgetId - Budget identifier
   * @returns Budget with items
   */
  @Get('client/:clientId/budget/:budgetId')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get budget by ID with items',
    description: 'Retrieve a specific budget with its budget items by its unique identifier',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'Client ID' })
  @ApiParam({ name: 'budgetId', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget with items retrieved successfully',
    type: BudgetWithItemsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async getBudgetWithItems(
    @ClientAccess() clientId: string,
    @Param('budgetId') budgetId: string,
  ): Promise<BudgetWithItemsResponseDto> {
    try {
      this.logger.log(`Getting budget with items ${budgetId} for client ${clientId}`)
      const result = await this.getBudgetByIdWithItemsUseCase.execute(budgetId)

      if (result.isSuccess) {
        return result.value
      }

      throw result.error
    } catch (error) {
      this.logger.error(`Error getting budget with items ${budgetId}:`, error)
      throw error
    }
  }

  /**
   * Get budget items for a specific budget
   * @param clientId - Client identifier (validated by ClientAccess decorator)
   * @param budgetId - Budget identifier
   * @param pagination - Pagination parameters
   * @returns Paginated list of budget items
   */
  @Get('client/:clientId/budget/:budgetId/items')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get budget items',
    description: 'Retrieve all items for a specific budget',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'Client ID' })
  @ApiParam({ name: 'budgetId', type: String, description: 'Budget ID' })
  @paginationQuery()
  @ApiResponse({
    status: 200,
    description: 'Budget items retrieved successfully',
    type: PaginatedBudgetItemsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async getBudgetItems(
    @ClientAccess() clientId: string,
    @Param('budgetId') budgetId: string,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedBudgetItemsResponseDto> {
    try {
      this.logger.log(`Getting budget items for budget ${budgetId} for client ${clientId}`)
      const result = await this.getBudgetItemsByBudgetIdPaginatedUseCase.execute(
        budgetId,
        pagination.page,
        pagination.limit,
      )

      if (result.isSuccess) {
        return result.value
      }

      throw result.error
    } catch (error) {
      this.logger.error(`Error getting budget items for budget ${budgetId}:`, error)
      throw error
    }
  }

  /**
   * Check if a budget is expired
   * @param clientId - Client identifier (validated by ClientAccess decorator)
   * @param budgetId - Budget identifier
   * @returns Boolean indicating if budget is expired
   */
  @Get('client/:clientId/budget/:budgetId/expired')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check if budget is expired',
    description: 'Check if a specific budget has expired',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'Client ID' })
  @ApiParam({ name: 'budgetId', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget expiration status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        expired: { type: 'boolean' },
        budgetId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async isBudgetExpired(
    @ClientAccess() clientId: string,
    @Param('budgetId') budgetId: string,
  ): Promise<{ expired: boolean; budgetId: string }> {
    try {
      this.logger.log(`Checking if budget ${budgetId} is expired for client ${clientId}`)
      const result = await this.checkBudgetExpirationUseCase.execute(budgetId)

      if (result.isSuccess) {
        return { expired: result.value, budgetId }
      }

      throw result.error
    } catch (error) {
      this.logger.error(`Error checking if budget ${budgetId} is expired:`, error)
      throw error
    }
  }

  /**
   * Approve a budget by ID
   * @param budgetId - Budget identifier
   * @returns Approved budget details
   */
  @Post(':budgetId/approve')
  @ApiOperation({
    summary: 'Approve budget',
    description: 'Approve a budget by its unique identifier',
  })
  @ApiParam({ name: 'budgetId', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget approved successfully',
    type: BudgetWithItemsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Budget cannot be approved (already approved, expired, or invalid status)',
  })
  async approveBudget(@Param('budgetId') budgetId: string): Promise<BudgetWithItemsResponseDto> {
    try {
      this.logger.log(`Approving budget ${budgetId}`)
      const approveResult = await this.approveBudgetUseCase.execute(budgetId)

      if (!approveResult.isSuccess) {
        throw approveResult.error
      }

      const getResult = await this.getBudgetByIdWithItemsUseCase.execute(budgetId)

      if (getResult.isSuccess) {
        return getResult.value
      }

      throw getResult.error
    } catch (error) {
      this.logger.error(`Error approving budget ${budgetId}:`, error)
      throw error
    }
  }

  /**
   * Reject a budget by ID
   * @param budgetId - Budget identifier
   * @param body - Request body containing optional rejection reason
   * @param body.reason - Optional rejection reason
   * @returns Rejected budget details
   */
  @Post(':budgetId/reject')
  @ApiOperation({
    summary: 'Reject budget',
    description: 'Reject a budget by its unique identifier',
  })
  @ApiParam({ name: 'budgetId', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget rejected successfully',
    type: BudgetWithItemsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Budget cannot be rejected (already rejected, expired, or invalid status)',
  })
  async rejectBudget(
    @Param('budgetId') budgetId: string,
    @Body() body?: { reason?: string },
  ): Promise<BudgetWithItemsResponseDto> {
    try {
      this.logger.log(`Rejecting budget ${budgetId}`)
      const rejectResult = await this.rejectBudgetUseCase.execute(budgetId, body?.reason)

      if (!rejectResult.isSuccess) {
        throw rejectResult.error
      }

      const getResult = await this.getBudgetByIdWithItemsUseCase.execute(budgetId)

      if (getResult.isSuccess) {
        return getResult.value
      }

      throw getResult.error
    } catch (error) {
      this.logger.error(`Error rejecting budget ${budgetId}:`, error)
      throw error
    }
  }
}

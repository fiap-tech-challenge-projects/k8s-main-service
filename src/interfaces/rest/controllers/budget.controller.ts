import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

import {
  BudgetResponseDto,
  BudgetWithItemsResponseDto,
  CreateBudgetDto,
  PaginatedBudgetsResponseDto,
  UpdateBudgetDto,
} from '@application/budget/dto'
import { BudgetPresenter, BudgetHttpResponse } from '@application/budget/presenters'
import {
  CreateBudgetUseCase,
  GetBudgetByIdUseCase,
  ApproveBudgetUseCase,
  RejectBudgetUseCase,
  GetAllBudgetsUseCase,
  GetBudgetByClientNameUseCase,
  GetBudgetByIdWithItemsUseCase,
  SendBudgetUseCase,
  MarkBudgetAsReceivedUseCase,
  CheckBudgetExpirationUseCase,
  UpdateBudgetUseCase,
  DeleteBudgetUseCase,
} from '@application/budget/use-cases'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'
import { ResultHelper } from '@shared/utils'

/**
 * REST controller for managing budgets
 * Handles HTTP requests and responses for budget management
 */
@ApiTags('Budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BudgetController {
  private readonly logger = new Logger(BudgetController.name)

  /**
   * Constructor for BudgetController
   * @param createBudgetUseCase Use case for creating budgets
   * @param getBudgetByIdUseCase Use case for getting budget by ID
   * @param approveBudgetUseCase Use case for approving budgets
   * @param rejectBudgetUseCase Use case for rejecting budgets
   * @param getAllBudgetsUseCase Use case for getting all budgets
   * @param getBudgetByClientNameUseCase Use case for getting budgets by client name
   * @param getBudgetByIdWithItemsUseCase Use case for getting budget by ID with items
   * @param sendBudgetUseCase Use case for sending budget
   * @param markBudgetAsReceivedUseCase Use case for marking budget as received
   * @param checkBudgetExpirationUseCase Use case for checking budget expiration
   * @param updateBudgetUseCase Use case for updating budget
   * @param deleteBudgetUseCase Use case for deleting budget
   * @param budgetPresenter Budget presenter for response formatting
   */
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetByIdUseCase: GetBudgetByIdUseCase,
    private readonly approveBudgetUseCase: ApproveBudgetUseCase,
    private readonly rejectBudgetUseCase: RejectBudgetUseCase,
    private readonly getAllBudgetsUseCase: GetAllBudgetsUseCase,
    private readonly getBudgetByClientNameUseCase: GetBudgetByClientNameUseCase,
    private readonly getBudgetByIdWithItemsUseCase: GetBudgetByIdWithItemsUseCase,
    private readonly sendBudgetUseCase: SendBudgetUseCase,
    private readonly markBudgetAsReceivedUseCase: MarkBudgetAsReceivedUseCase,
    private readonly checkBudgetExpirationUseCase: CheckBudgetExpirationUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly deleteBudgetUseCase: DeleteBudgetUseCase,
    private readonly budgetPresenter: BudgetPresenter,
  ) {}

  /**
   * Create a new budget
   * @param createBudgetDto Data for creating a new budget
   * @returns Created budget details
   * */
  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create budget',
    description: 'Create a new budget with the provided data',
  })
  @ApiBody({
    type: CreateBudgetDto,
    description: 'budget data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'budget created successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid budget data',
  })
  @ApiResponse({
    status: 409,
    description: 'Budget already exists',
  })
  async create(@Body() createBudgetDto: CreateBudgetDto): Promise<BudgetHttpResponse> {
    const result = await this.createBudgetUseCase.execute(createBudgetDto)

    if (result.isSuccess) {
      return this.budgetPresenter.present(result.value)
    }

    this.logger.error('Error creating budget', result.error)
    throw result.error
  }

  /**
   * Get all budgets with pagination
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Paginated list of budgets
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all budgets',
    description: 'Retrieve a paginated list of all budgets',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'List of budgets retrieved successfully',
    type: PaginatedBudgetsResponseDto,
  })
  async getAllBudget(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedBudgetsResponseDto> {
    const result = await this.getAllBudgetsUseCase.execute(page, limit)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error('Error getting all budgets', result.error)
    throw result.error
  }

  /**
   * Search budgets by client name with pagination
   * @param clientName - Client name to search for
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Paginated list of budgets matching the client name
   * */
  @Get('search/client')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Search budgets by client name',
    description: 'Search for budgets by client name with pagination',
  })
  @ApiQuery({ name: 'clientName', type: String, description: 'Client name to search for' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Budgets matching the client name retrieved successfully',
    type: PaginatedBudgetsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No budgets found for the specified client name',
  })
  async searchByClientName(
    @Query('clientName') clientName: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedBudgetsResponseDto> {
    try {
      const result = await this.getBudgetByClientNameUseCase.execute(clientName, page, limit)
      return ResultHelper.unwrapOrThrow(result)
    } catch (error) {
      this.logger.error(`Error searching budgets by client name "${clientName}":`, error)
      throw error
    }
  }

  /**
   * Get a budget by ID
   * @param id - Budget's unique identifier
   * @returns Budget details
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get budget by ID',
    description: 'Retrieve a specific budget by its unique identifier',
  })
  @ApiParam({ name: 'id', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget retrieved successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async getById(@Param('id') id: string): Promise<BudgetHttpResponse> {
    const result = await this.getBudgetByIdUseCase.execute(id)

    if (result.isSuccess) {
      return this.budgetPresenter.present(result.value)
    }

    this.logger.error(`Error getting budget ${id}:`, result.error)
    throw result.error
  }

  /**
   * Get a budget by ID with its budget items
   * @param id - Budget's unique identifier
   * @returns Budget details with items
   */
  @Get(':id/with-items')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get budget by ID with items',
    description: 'Retrieve a specific budget with its budget items by its unique identifier',
  })
  @ApiParam({ name: 'id', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget with items retrieved successfully',
    type: BudgetWithItemsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async getByIdWithItems(@Param('id') id: string): Promise<BudgetWithItemsResponseDto> {
    const result = await this.getBudgetByIdWithItemsUseCase.execute(id)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error getting budget with items ${id}:`, result.error)
    throw result.error
  }

  /**
   * Approve a budget by ID
   * @param id - Budget's unique identifier
   * @returns Approved budget details
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Approve budget',
    description: 'Approve a budget by its unique identifier',
  })
  @ApiParam({ name: 'id', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget approved successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Budget cannot be approved (already approved, expired, or invalid status)',
  })
  async approve(@Param('id') id: string): Promise<BudgetHttpResponse> {
    const result = await this.approveBudgetUseCase.execute(id)

    if (result.isSuccess) {
      return this.budgetPresenter.present(result.value)
    }

    this.logger.error(`Error approving budget ${id}:`, result.error)
    throw result.error
  }

  /**
   * Reject a budget by ID
   * @param id - Budget's unique identifier
   * @returns Rejected budget details
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Reject budget',
    description: 'Reject a budget by its unique identifier',
  })
  @ApiParam({ name: 'id', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget rejected successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Budget cannot be rejected (already rejected, expired, or invalid status)',
  })
  async reject(@Param('id') id: string): Promise<BudgetHttpResponse> {
    const result = await this.rejectBudgetUseCase.execute(id)

    if (result.isSuccess) {
      return this.budgetPresenter.present(result.value)
    }

    this.logger.error(`Error rejecting budget ${id}:`, result.error)
    throw result.error
  }

  /**
   * Send a budget by ID
   * @param id - Budget's unique identifier
   * @returns Sent budget details
   */
  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Send budget',
    description: 'Send a budget by its unique identifier',
  })
  @ApiParam({ name: 'id', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget sent successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Budget cannot be sent (invalid status transition)',
  })
  async send(@Param('id') id: string): Promise<BudgetHttpResponse> {
    const result = await this.sendBudgetUseCase.execute(id)

    if (result.isSuccess) {
      return this.budgetPresenter.present(result.value)
    }

    this.logger.error(`Error sending budget ${id}:`, result.error)
    throw result.error
  }

  /**
   * Mark a budget as received by ID
   * @param id - Budget's unique identifier
   * @returns Received budget details
   */
  @Post(':id/receive')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Mark budget as received',
    description: 'Mark a budget as received by its unique identifier',
  })
  @ApiParam({ name: 'id', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget marked as received successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Budget cannot be marked as received (invalid status transition)',
  })
  async markAsReceived(@Param('id') id: string): Promise<BudgetHttpResponse> {
    try {
      const result = await this.markBudgetAsReceivedUseCase.execute(id)

      if (result.isSuccess) {
        return this.budgetPresenter.present(result.value)
      }

      this.logger.error(`Error marking budget as received ${id}:`, result.error)
      throw result.error
    } catch (error) {
      this.logger.error(`Error marking budget as received ${id}:`, error)
      throw error
    }
  }

  /**
   * Check if a budget is expired by ID
   * @param id - Budget's unique identifier
   * @returns True if expired, false otherwise
   */
  @Get(':id/expired')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check if budget is expired',
    description: 'Check if a budget is expired by its unique identifier',
  })
  @ApiParam({ name: 'id', type: String, description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Expiration status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        expired: {
          type: 'boolean',
          description: 'Whether the budget is expired',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async isExpired(@Param('id') id: string): Promise<{ expired: boolean }> {
    const result = await this.checkBudgetExpirationUseCase.execute(id)

    if (result.isSuccess) {
      return { expired: result.value }
    }

    this.logger.error(`Error checking budget expiration ${id}:`, result.error)
    throw result.error
  }

  /**
   * Update an existing budget
   * @param id - Budget's unique identifier
   * @param updateBudgetDto Data for updating the budget
   * @returns Updated budget details
   * */
  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update an existing budget',
    description: 'Update budget details by its unique identifier',
  })
  @ApiParam({ name: 'id', type: String, description: 'Budget ID' })
  @ApiBody({ type: UpdateBudgetDto })
  @ApiResponse({
    status: 200,
    description: 'Budget updated successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ): Promise<BudgetHttpResponse> {
    const result = await this.updateBudgetUseCase.execute(id, updateBudgetDto)

    if (result.isSuccess) {
      return this.budgetPresenter.present(result.value)
    }

    this.logger.error(`Error updating budget ${id}:`, result.error)
    throw result.error
  }

  /**
   * Delete a budget by ID
   * @param id - Budget's unique identifier
   * @return True if deleted, false if not found
   * */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete budget',
    description: 'Delete an existing budget',
  })
  @ApiParam({
    name: 'id',
    description: 'budget unique identifier',
    example: '12345',
  })
  @ApiResponse({
    status: 204,
    description: 'budget deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    try {
      const result = await this.deleteBudgetUseCase.execute(id)

      if (result.isFailure) {
        throw result.error
      }
    } catch (error) {
      this.logger.error(`Error deleting budget ${id}:`, error)
      throw error
    }
  }
}

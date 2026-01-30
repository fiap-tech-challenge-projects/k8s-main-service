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
  CreateBudgetItemDto,
  UpdateBudgetItemDto,
  BudgetItemResponseDto,
  PaginatedBudgetItemsResponseDto,
} from '@application/budget-items/dto'
import {
  CreateBudgetItemUseCase,
  GetBudgetItemByIdUseCase,
  GetAllBudgetItemsUseCase,
  UpdateBudgetItemUseCase,
  DeleteBudgetItemUseCase,
} from '@application/budget-items/use-cases'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * Controller for managing budget items.
 * Provides endpoints for creating, retrieving, updating, and deleting budget items.
 * Uses use cases to orchestrate business operations following clean architecture principles.
 */
@ApiTags('Budget Items')
@Controller('budget-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BudgetItemController {
  private readonly logger = new Logger(BudgetItemController.name)

  /**
   * Initializes a new instance of the BudgetItemController.
   *
   * @param createBudgetItemUseCase - Use case for creating budget items
   * @param getBudgetItemByIdUseCase - Use case for getting budget item by ID
   * @param getAllBudgetItemsUseCase - Use case for getting all budget items
   * @param updateBudgetItemUseCase - Use case for updating budget items
   * @param deleteBudgetItemUseCase - Use case for deleting budget items
   */
  constructor(
    private readonly createBudgetItemUseCase: CreateBudgetItemUseCase,
    private readonly getBudgetItemByIdUseCase: GetBudgetItemByIdUseCase,
    private readonly getAllBudgetItemsUseCase: GetAllBudgetItemsUseCase,
    private readonly updateBudgetItemUseCase: UpdateBudgetItemUseCase,
    private readonly deleteBudgetItemUseCase: DeleteBudgetItemUseCase,
  ) {}

  /**
   * Creates a new budget item.
   *
   * @param createBudgetItemDto - The DTO containing budget item details.
   * @returns The created budget item.
   * @throws {Error} If there is an error during creation.
   */
  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create budget item', description: 'Create a new budget item' })
  @ApiBody({ type: CreateBudgetItemDto })
  @ApiResponse({ status: 201, description: 'Budget item created', type: BudgetItemResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid budget item data' })
  @ApiResponse({ status: 409, description: 'Budget item already exists' })
  async create(@Body() createBudgetItemDto: CreateBudgetItemDto): Promise<BudgetItemResponseDto> {
    const result = await this.createBudgetItemUseCase.execute(createBudgetItemDto)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error('Error creating budget item:', result.error)
    throw result.error
  }

  /**
   * Retrieves all budget items with optional pagination.
   *
   * @param page - The page number for pagination (optional).
   * @param limit - The number of items per page (optional).
   * @returns A paginated response containing budget items.
   * @throws {Error} If there is an error during retrieval.
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all budget items',
    description: 'List all budget items with pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: PaginatedBudgetItemsResponseDto })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedBudgetItemsResponseDto> {
    const result = await this.getAllBudgetItemsUseCase.execute(page, limit)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error('Error retrieving budget items:', result.error)
    throw result.error
  }

  /**
   * Retrieves a budget item by its ID.
   *
   * @param id - The unique identifier of the budget item.
   * @returns The budget item with the specified ID.
   * @throws {NotFoundException} If the budget item with the specified ID does not exist.
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get budget item by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: BudgetItemResponseDto })
  @ApiResponse({ status: 404, description: 'Budget item not found' })
  async findById(@Param('id') id: string): Promise<BudgetItemResponseDto> {
    const result = await this.getBudgetItemByIdUseCase.execute(id)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error retrieving budget item ${id}:`, result.error)
    throw result.error
  }

  /**
   * Updates an existing budget item by its ID.
   *
   * @param id - The unique identifier of the budget item to update.
   * @param updateBudgetItemDto - The DTO containing updated budget item details.
   * @returns The updated budget item.
   * @throws {NotFoundException} If the budget item with the specified ID does not exist.
   */
  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update budget item' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateBudgetItemDto })
  @ApiResponse({ status: 200, type: BudgetItemResponseDto })
  @ApiResponse({ status: 404, description: 'Budget item not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBudgetItemDto: UpdateBudgetItemDto,
  ): Promise<BudgetItemResponseDto> {
    const result = await this.updateBudgetItemUseCase.execute(id, updateBudgetItemDto)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error updating budget item ${id}:`, result.error)
    throw result.error
  }

  /**
   * Deletes a budget item by its ID.
   *
   * @param id - The unique identifier of the budget item to delete.
   * @returns A promise that resolves when the budget item is deleted.
   * @throws {NotFoundException} If the budget item with the specified ID does not exist.
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete budget item' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Budget item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Budget item not found' })
  async delete(@Param('id') id: string): Promise<void> {
    const result = await this.deleteBudgetItemUseCase.execute(id)

    if (result.isSuccess) {
      return
    }

    this.logger.error(`Error deleting budget item ${id}:`, result.error)
    throw result.error
  }
}

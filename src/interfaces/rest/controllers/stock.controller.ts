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
  CreateStockItemDto,
  UpdateStockItemDto,
  StockItemResponseDto,
  PaginatedStockItemDto,
  CreateStockMovementDto,
  UpdateStockMovementDto,
  StockMovementResponseDto,
  DecreaseStockDto,
} from '@application/stock/dto'
import {
  CreateStockItemUseCase,
  GetAllStockItemsUseCase,
  GetStockItemByIdUseCase,
  GetStockItemBySkuUseCase,
  GetStockItemsByNameUseCase,
  GetStockItemsBySupplierUseCase,
  UpdateStockItemUseCase,
  DeleteStockItemUseCase,
  CreateStockMovementUseCase,
  UpdateStockMovementUseCase,
  DecreaseStockUseCase,
  CheckSkuAvailabilityUseCase,
  CheckStockAvailabilityUseCase,
} from '@application/stock/use-cases'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * REST controller for managing stock items
 * Provides endpoints for CRUD operations on stock items
 */
@ApiTags('Stock')
@Controller('stocks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StockController {
  private readonly logger = new Logger(StockController.name)

  /**
   * Constructor for StockController
   * @param createStockItemUseCase - Create stock item use case
   * @param getAllStockItemsUseCase - Get all stock items use case
   * @param getStockItemByIdUseCase - Get stock item by ID use case
   * @param getStockItemBySkuUseCase - Get stock item by SKU use case
   * @param getStockItemsByNameUseCase - Get stock items by name use case
   * @param getStockItemsBySupplierUseCase - Get stock items by supplier use case
   * @param updateStockItemUseCase - Update stock item use case
   * @param deleteStockItemUseCase - Delete stock item use case
   * @param createStockMovementUseCase - Create stock movement use case
   * @param updateStockMovementUseCase - Update stock movement use case
   * @param decreaseStockUseCase - Decrease stock use case
   * @param checkSkuAvailabilityUseCase - Check SKU availability use case
   * @param checkStockAvailabilityUseCase - Check stock availability use case
   */
  constructor(
    private readonly createStockItemUseCase: CreateStockItemUseCase,
    private readonly getAllStockItemsUseCase: GetAllStockItemsUseCase,
    private readonly getStockItemByIdUseCase: GetStockItemByIdUseCase,
    private readonly getStockItemBySkuUseCase: GetStockItemBySkuUseCase,
    private readonly getStockItemsByNameUseCase: GetStockItemsByNameUseCase,
    private readonly getStockItemsBySupplierUseCase: GetStockItemsBySupplierUseCase,
    private readonly updateStockItemUseCase: UpdateStockItemUseCase,
    private readonly deleteStockItemUseCase: DeleteStockItemUseCase,
    private readonly createStockMovementUseCase: CreateStockMovementUseCase,
    private readonly updateStockMovementUseCase: UpdateStockMovementUseCase,
    private readonly decreaseStockUseCase: DecreaseStockUseCase,
    private readonly checkSkuAvailabilityUseCase: CheckSkuAvailabilityUseCase,
    private readonly checkStockAvailabilityUseCase: CheckStockAvailabilityUseCase,
  ) {}

  /**
   * Create a new stock item
   * @param createStockItemDto - Stock item data to create
   * @returns Promise resolving to the stock item response
   */
  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create stock item',
    description: 'Create a new stock item with the provided data',
  })
  @ApiBody({
    type: CreateStockItemDto,
    description: 'Stock item data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Stock item created successfully',
    type: StockItemResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid stock item data',
  })
  @ApiResponse({
    status: 409,
    description: 'SKU already registered',
  })
  async createStockItem(
    @Body() createStockItemDto: CreateStockItemDto,
  ): Promise<StockItemResponseDto> {
    try {
      const result = await this.createStockItemUseCase.execute(createStockItemDto)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error creating stock item:', error)
      throw error
    }
  }

  /**
   * Get all stock items with pagination and optional filters
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated stock items response
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all stock items',
    description: 'Retrieve all stock items with optional pagination and filters',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Stock items retrieved successfully',
    type: PaginatedStockItemDto,
  })
  async getAllStockItems(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedStockItemDto> {
    try {
      const result = await this.getAllStockItemsUseCase.execute(page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error getting all stock items:', error)
      throw error
    }
  }

  /**
   * Get stock item by ID
   * @param id - Stock item's unique identifier
   * @returns Promise resolving to the stock item response
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get stock item by ID',
    description: 'Retrieve a specific stock item by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock item unique identifier',
    example: 'stock-1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock item retrieved successfully',
    type: StockItemResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Stock item not found',
  })
  async getStockItemById(@Param('id') id: string): Promise<StockItemResponseDto> {
    const result = await this.getStockItemByIdUseCase.execute(id)

    if (result.isFailure) {
      throw result.error
    }

    return result.value
  }

  /**
   * Get stock item by SKU
   * @param sku - Stock item's SKU
   * @returns Promise resolving to the stock item response
   */
  @Get('search/sku/:sku')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get stock item by SKU',
    description: 'Retrieve a specific stock item by its SKU',
  })
  @ApiParam({
    name: 'sku',
    description: 'Stock item SKU',
    example: 'FLT-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock item retrieved successfully',
    type: StockItemResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Stock item not found',
  })
  async getStockItemBySku(@Param('sku') sku: string): Promise<StockItemResponseDto> {
    const result = await this.getStockItemBySkuUseCase.execute(sku)

    if (result.isFailure) {
      throw result.error
    }

    return result.value
  }

  /**
   * Get stock items by name with pagination
   * @param name - Stock item's name
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated stock items response
   */
  @Get('search/name/:name')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get stock items by name',
    description: 'Retrieve stock items by name with optional pagination',
  })
  @ApiParam({
    name: 'name',
    description: 'Stock item name',
    example: 'Filtro de Óleo',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Stock items retrieved successfully',
    type: PaginatedStockItemDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No stock items found with the given name',
  })
  async getStockItemsByName(
    @Param('name') name: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedStockItemDto> {
    try {
      const result = await this.getStockItemsByNameUseCase.execute(name, page, limit)

      if (result.isFailure) {
        throw result.error
      }

      const stockItems = result.value

      if (!stockItems.data || stockItems.data.length === 0) {
        this.logger.warn(`No stock items found with name: ${name}`)
      }

      return stockItems
    } catch (error) {
      this.logger.error(`Error getting stock items by name ${name}:`, error)
      throw error
    }
  }

  /**
   * Get stock items by supplier with pagination
   * @param supplier - Stock item's supplier
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated stock items response
   */
  @Get('search/supplier/:supplier')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get stock items by supplier',
    description: 'Retrieve stock items by supplier with optional pagination',
  })
  @ApiParam({
    name: 'supplier',
    description: 'Stock item supplier',
    example: 'Bosch',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Stock items retrieved successfully',
    type: PaginatedStockItemDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No stock items found with the given supplier',
  })
  async getStockItemsBySupplier(
    @Param('supplier') supplier: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedStockItemDto> {
    try {
      const result = await this.getStockItemsBySupplierUseCase.execute(supplier, page, limit)

      if (result.isFailure) {
        throw result.error
      }

      const stockItems = result.value

      if (!stockItems.data || stockItems.data.length === 0) {
        this.logger.warn(`No stock items found with supplier: ${supplier}`)
      }

      return stockItems
    } catch (error) {
      this.logger.error(`Error getting stock items by supplier ${supplier}:`, error)
      throw error
    }
  }

  /**
   * Update stock item
   * @param id - Stock item's unique identifier
   * @param updateStockItemData - Stock item data to update
   * @returns Promise resolving to the stock item response
   */
  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update stock item',
    description: 'Update an existing stock item with the provided data',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock item unique identifier',
    example: 'stock-1234567890abcdef',
  })
  @ApiBody({
    type: UpdateStockItemDto,
    description: 'Stock item data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock item updated successfully',
    type: StockItemResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid stock item data',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock item not found',
  })
  async updateStockItem(
    @Param('id') id: string,
    @Body()
    updateStockItemData: UpdateStockItemDto,
  ): Promise<StockItemResponseDto> {
    try {
      const result = await this.updateStockItemUseCase.execute(id, updateStockItemData)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error(`Error updating stock item ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete stock item
   * @param id - Stock item's unique identifier
   * @returns Promise resolving to void
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete stock item',
    description: 'Delete an existing stock item',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock item unique identifier',
    example: 'stock-1234567890abcdef',
  })
  @ApiResponse({
    status: 204,
    description: 'Stock item deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock item not found',
  })
  async deleteStockItem(@Param('id') id: string): Promise<void> {
    const result = await this.deleteStockItemUseCase.execute(id)

    if (result.isFailure) {
      throw result.error
    }
  }

  // Stock Movement Management

  /**
   * Create a new stock movement
   * @param createStockMovementDto - Stock movement data to create
   * @returns Promise resolving to the stock movement response
   */
  @Post('movements')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create stock movement',
    description: 'Create a new stock movement and update stock levels',
  })
  @ApiBody({
    type: CreateStockMovementDto,
    description: 'Stock movement data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Stock movement created successfully',
    type: StockMovementResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid stock movement data',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock item not found',
  })
  async createStockMovement(
    @Body() createStockMovementDto: CreateStockMovementDto,
  ): Promise<StockMovementResponseDto> {
    try {
      const result = await this.createStockMovementUseCase.execute(createStockMovementDto)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error creating stock movement:', error)
      throw error
    }
  }

  /**
   * Update a stock movement
   * @param id - Stock movement's unique identifier
   * @param updateStockMovementDto - Stock movement data to update
   * @returns Promise resolving to the stock movement response
   */
  @Put('movements/:id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update stock movement',
    description: 'Update an existing stock movement and adjust stock levels',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock movement unique identifier',
    example: 'movement-1234567890abcdef',
  })
  @ApiBody({
    type: UpdateStockMovementDto,
    description: 'Stock movement data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock movement updated successfully',
    type: StockMovementResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid stock movement data',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock movement not found',
  })
  async updateStockMovement(
    @Param('id') id: string,
    @Body() updateStockMovementDto: UpdateStockMovementDto,
  ): Promise<StockMovementResponseDto> {
    try {
      const result = await this.updateStockMovementUseCase.execute(id, updateStockMovementDto)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error(`Error updating stock movement ${id}:`, error)
      throw error
    }
  }

  /**
   * Decrease stock for a specific item
   * @param stockItemId - Stock item's unique identifier
   * @param body - Request body containing quantity and reason
   * @param body.quantity - Quantity to decrease
   * @param body.reason - Reason for the stock decrease
   * @returns Promise resolving to the stock movement response
   */
  @Post(':id/decrease')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Decrease stock',
    description: 'Decrease stock for a specific item and create a movement record',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock item unique identifier',
    example: 'stock-1234567890abcdef',
  })
  @ApiBody({
    type: DecreaseStockDto,
    description: 'Stock decrease data',
  })
  @ApiResponse({
    status: 201,
    description: 'Stock decreased successfully',
    type: StockItemResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid decrease data or insufficient stock',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock item not found',
  })
  async decreaseStock(
    @Param('id') stockItemId: string,
    @Body() body: DecreaseStockDto,
  ): Promise<StockItemResponseDto> {
    try {
      // Create the movement but return the updated stock item
      const decreaseResult = await this.decreaseStockUseCase.execute(
        stockItemId,
        body.quantity,
        body.reason,
      )

      if (decreaseResult.isFailure) {
        throw decreaseResult.error
      }

      // Get and return the updated stock item
      const stockItemResult = await this.getStockItemByIdUseCase.execute(stockItemId)

      if (stockItemResult.isFailure) {
        throw stockItemResult.error
      }

      return stockItemResult.value
    } catch (error) {
      this.logger.error(`Error decreasing stock for ${stockItemId} by ${body.quantity}:`, error)
      throw error
    }
  }

  // Stock Item Utility Endpoints

  /**
   * Check if SKU is available
   * @param sku - SKU to check
   * @returns Promise resolving to availability status
   */
  @Get('check/sku/:sku')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check SKU availability',
    description: 'Check if a SKU is available for registration',
  })
  @ApiParam({
    name: 'sku',
    description: 'SKU to check',
    example: 'FLT-001',
  })
  @ApiResponse({
    status: 200,
    description: 'SKU availability checked successfully',
    schema: {
      type: 'object',
      properties: {
        exists: {
          type: 'boolean',
          description: 'Whether the SKU exists',
        },
        sku: {
          type: 'string',
          description: 'The SKU that was checked',
        },
      },
    },
  })
  async checkSkuAvailability(@Param('sku') sku: string): Promise<{ exists: boolean; sku: string }> {
    try {
      const result = await this.checkSkuAvailabilityUseCase.execute(sku)

      if (result.isFailure) {
        throw result.error
      }

      const available = result.value
      return { exists: !available, sku }
    } catch (error) {
      this.logger.error(`Error checking SKU availability ${sku}:`, error)
      throw error
    }
  }

  /**
   * Check if stock item has sufficient stock
   * @param id - Stock item's unique identifier
   * @param quantity - Quantity to check
   * @returns Promise resolving to stock availability status
   */
  @Get('check/stock/:id/:quantity')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check stock availability',
    description: 'Check if a stock item has sufficient quantity available',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock item unique identifier',
    example: 'stock-1234567890abcdef',
  })
  @ApiParam({
    name: 'quantity',
    description: 'Quantity to check',
    example: '5',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock availability checked successfully',
    schema: {
      type: 'object',
      properties: {
        available: {
          type: 'boolean',
          description: 'Whether the item has sufficient stock',
        },
        requestedQuantity: {
          type: 'number',
          description: 'The quantity that was requested',
        },
        currentStock: {
          type: 'number',
          description: 'The current stock level',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Stock item not found',
  })
  async checkStockAvailability(
    @Param('id') id: string,
    @Param('quantity') quantity: number,
  ): Promise<{ available: boolean; requestedQuantity: number; currentStock: number }> {
    try {
      const stockItemResult = await this.getStockItemByIdUseCase.execute(id)

      if (stockItemResult.isFailure) {
        throw stockItemResult.error
      }

      const stockItem = stockItemResult.value

      const hasStockResult = await this.checkStockAvailabilityUseCase.execute(id, quantity)

      if (hasStockResult.isFailure) {
        throw hasStockResult.error
      }

      const hasStock = hasStockResult.value

      return {
        available: hasStock,
        requestedQuantity: quantity,
        currentStock: stockItem.currentStock,
      }
    } catch (error) {
      this.logger.error(
        `Error checking stock availability for ${id} with quantity ${quantity}:`,
        error,
      )
      throw error
    }
  }
}

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
import { ServiceOrderStatus, UserRole } from '@prisma/client'

import {
  CreateServiceOrderDto,
  UpdateServiceOrderDto,
  ServiceOrderResponseDto,
  PaginatedServiceOrdersResponseDto,
} from '@application/service-orders/dto'
import { ServiceOrderPresenter } from '@application/service-orders/presenters'
import {
  CreateServiceOrderUseCase,
  GetServiceOrderByIdUseCase,
  GetAllServiceOrdersUseCase,
  UpdateServiceOrderUseCase,
  GetServiceOrdersByStatusUseCase,
  GetServiceOrdersByClientIdUseCase,
  GetServiceOrdersByVehicleIdUseCase,
  GetOverdueServiceOrdersUseCase,
  DeleteServiceOrderUseCase,
} from '@application/service-orders/use-cases'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * REST controller for service order operations.
 * Provides HTTP endpoints for managing service orders.
 */
@ApiTags('Service Orders')
@Controller('service-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServiceOrderController {
  /** Logger instance for this controller */
  private readonly logger = new Logger(ServiceOrderController.name)

  /**
   * Creates a new instance of ServiceOrderController.
   * @param presenter - Service order presenter for formatting responses
   * @param createServiceOrderUseCase - Use case for creating service orders
   * @param getServiceOrderByIdUseCase - Use case for getting service order by ID
   * @param getAllServiceOrdersUseCase - Use case for getting all service orders
   * @param updateServiceOrderUseCase - Use case for updating service orders
   * @param getServiceOrdersByStatusUseCase - Use case for getting service orders by status
   * @param getServiceOrdersByClientIdUseCase - Use case for getting service orders by client ID
   * @param getServiceOrdersByVehicleIdUseCase - Use case for getting service orders by vehicle ID
   * @param getOverdueServiceOrdersUseCase - Use case for getting overdue service orders
   * @param deleteServiceOrderUseCase - Use case for deleting service orders
   */
  constructor(
    private readonly presenter: ServiceOrderPresenter,
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
    private readonly getServiceOrderByIdUseCase: GetServiceOrderByIdUseCase,
    private readonly getAllServiceOrdersUseCase: GetAllServiceOrdersUseCase,
    private readonly updateServiceOrderUseCase: UpdateServiceOrderUseCase,
    private readonly getServiceOrdersByStatusUseCase: GetServiceOrdersByStatusUseCase,
    private readonly getServiceOrdersByClientIdUseCase: GetServiceOrdersByClientIdUseCase,
    private readonly getServiceOrdersByVehicleIdUseCase: GetServiceOrdersByVehicleIdUseCase,
    private readonly getOverdueServiceOrdersUseCase: GetOverdueServiceOrdersUseCase,
    private readonly deleteServiceOrderUseCase: DeleteServiceOrderUseCase,
  ) {}

  /**
   * Creates a new service order.
   * @param dto - The data for creating the service order
   * @returns The created service order response DTO
   */
  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new service order',
    description:
      'Creates a new service order with the provided data. Employees create service orders with RECEIVED status, which automatically triggers budget creation.',
  })
  @ApiBody({
    type: CreateServiceOrderDto,
    description: 'Service order data to create',
    examples: {
      basic: {
        summary: 'Basic service order (Employee)',
        description:
          'Create a service order with minimal required data. Will be created with RECEIVED status.',
        value: {
          vehicleId: 'vehicle-4567890123-def456ghi',
        },
      },
      withNotes: {
        summary: 'Service order with notes (Employee)',
        description:
          'Create a service order with additional notes. Will be created with RECEIVED status.',
        value: {
          vehicleId: 'vehicle-4567890123-def456ghi',
          notes:
            'Customer reported engine noise and reduced performance. Check for oil leaks and perform diagnostic scan.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Service order created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clientId: { type: 'string' },
        vehicleId: { type: 'string' },
        status: { type: 'string' },
        requestDate: { type: 'string', format: 'date-time' },
        deliveryDate: { type: 'string', format: 'date-time', nullable: true },
        cancellationReason: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid service order data or validation errors',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async create(@Body() dto: CreateServiceOrderDto): Promise<{
    statusCode: HttpStatus
    message: string
    data: ServiceOrderResponseDto
  }> {
    console.log('========== SERVICE ORDER CONTROLLER CREATE ==========')
    console.log('Received DTO:', dto)
    console.log('About to call createServiceOrderUseCase.execute...')

    const result = await this.createServiceOrderUseCase.execute(dto)

    console.log('========== USE CASE RESULT ==========')
    console.log('Is Success:', result.isSuccess)
    if (!result.isSuccess) {
      console.log('Error type:', result.error.constructor.name)
      console.log('Error message:', result.error.message)
      console.log('Error details:', result.error)
    }
    console.log('========== END CONTROLLER DEBUG ==========')

    if (result.isSuccess) {
      return ServiceOrderPresenter.presentCreateSuccess(result.value)
    }

    this.logger.error('Error creating service order:', result.error)
    throw result.error
  }

  /**
   * Retrieves a paginated list of service orders.
   * @param page - The page number (1-based)
   * @param limit - The number of items per page
   * @returns A paginated list of service order response DTOs
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all service orders',
    description:
      'Retrieve all service orders with optional pagination. Returns service orders ordered by creation date (newest first).',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based). Defaults to 1 if not provided.',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page. Defaults to 10 if not provided. Maximum 100.',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Service orders retrieved successfully',
    type: PaginatedServiceOrdersResponseDto,
  })
  async getAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedServiceOrdersResponseDto> {
    try {
      const result = await this.getAllServiceOrdersUseCase.execute(page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error getting all service orders:', error)
      throw error
    }
  }

  /**
   * Get service orders by status.
   * @param status - The status to filter by.
   * @param page - Page number (1-based).
   * @param limit - Number of items per page.
   * @returns Promise resolving to paginated service order response DTO.
   */
  @Get('status/:status')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service orders by status',
    description:
      'Retrieve service orders filtered by their current status. Useful for tracking orders in different stages.',
  })
  @ApiParam({
    name: 'status',
    description: 'Service order status to filter by',
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.IN_DIAGNOSIS,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based). Defaults to 1 if not provided.',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page. Defaults to 10 if not provided. Maximum 100.',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Service orders retrieved successfully',
    type: PaginatedServiceOrdersResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status parameter',
  })
  async getByStatus(
    @Param('status') status: ServiceOrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedServiceOrdersResponseDto> {
    try {
      const result = await this.getServiceOrdersByStatusUseCase.execute(status, page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error(`Error getting service orders by status ${status}:`, error)
      throw error
    }
  }

  /**
   * Get service orders by client ID.
   * @param clientId - The client ID to filter by.
   * @param page - Page number (1-based).
   * @param limit - Number of items per page.
   * @returns Promise resolving to paginated service order response DTO.
   */
  @Get('client/:clientId')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service orders by client ID',
    description:
      'Retrieve all service orders for a specific client. Useful for viewing client service history.',
  })
  @ApiParam({
    name: 'clientId',
    description: 'Client unique identifier',
    example: 'client-1234567890-abc123def',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based). Defaults to 1 if not provided.',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page. Defaults to 10 if not provided. Maximum 100.',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Service orders retrieved successfully',
    type: PaginatedServiceOrdersResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async getByClientId(
    @Param('clientId') clientId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedServiceOrdersResponseDto> {
    try {
      const result = await this.getServiceOrdersByClientIdUseCase.execute(clientId, page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error(`Error getting service orders by client ID ${clientId}:`, error)
      throw error
    }
  }

  /**
   * Get service orders by vehicle ID.
   * @param vehicleId - The vehicle ID to filter by.
   * @param page - Page number (1-based).
   * @param limit - Number of items per page.
   * @returns Promise resolving to paginated service order response DTO.
   */
  @Get('vehicle/:vehicleId')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service orders by vehicle ID',
    description:
      'Retrieve all service orders for a specific vehicle. Useful for viewing vehicle service history.',
  })
  @ApiParam({
    name: 'vehicleId',
    description: 'Vehicle unique identifier',
    example: 'vehicle-4567890123-def456ghi',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based). Defaults to 1 if not provided.',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page. Defaults to 10 if not provided. Maximum 100.',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Service orders retrieved successfully',
    type: PaginatedServiceOrdersResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async getByVehicleId(
    @Param('vehicleId') vehicleId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedServiceOrdersResponseDto> {
    try {
      const result = await this.getServiceOrdersByVehicleIdUseCase.execute(vehicleId, page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error(`Error getting service orders by vehicle ID ${vehicleId}:`, error)
      throw error
    }
  }

  /**
   * Get overdue service orders.
   * @param page - Page number (1-based).
   * @param limit - Number of items per page.
   * @returns Promise resolving to paginated service order response DTO.
   */
  @Get('overdue')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get overdue service orders',
    description:
      'Retrieve service orders that are past their delivery date. Useful for identifying orders that need attention.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based). Defaults to 1 if not provided.',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page. Defaults to 10 if not provided. Maximum 100.',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Overdue service orders retrieved successfully',
    type: PaginatedServiceOrdersResponseDto,
  })
  async getOverdue(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedServiceOrdersResponseDto> {
    try {
      const result = await this.getOverdueServiceOrdersUseCase.execute(page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error getting overdue service orders:', error)
      throw error
    }
  }

  /**
   * Retrieves a service order by its unique identifier.
   * @param id - The unique identifier of the service order
   * @returns The service order response DTO or null if not found
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service order by ID',
    description: 'Retrieve a specific service order by its unique identifier with all details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Service order unique identifier',
    example: 'so-1704067200000-abc123def',
  })
  @ApiResponse({
    status: 200,
    description: 'Service order retrieved successfully',
    type: ServiceOrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service order not found',
  })
  async getById(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const result = await this.getServiceOrderByIdUseCase.execute(id)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error getting service order by id ${id}:`, result.error)
    throw result.error
  }

  /**
   * Updates a service order by its unique identifier.
   * @param id - The unique identifier of the service order
   * @param dto - The data for updating the service order
   * @returns The updated service order response DTO
   */
  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update a service order',
    description:
      'Update an existing service order with the provided data. Can update status, delivery date, cancellation reason, and notes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Service order unique identifier',
    example: 'so-1704067200000-abc123def',
  })
  @ApiBody({
    type: UpdateServiceOrderDto,
    description: 'Service order data to update',
    examples: {
      updateStatus: {
        summary: 'Update status',
        description: 'Update the service order status',
        value: {
          status: 'IN_DIAGNOSIS',
        },
      },
      updateDeliveryDate: {
        summary: 'Update delivery date',
        description: 'Set the delivery date for the service order',
        value: {
          deliveryDate: '2024-01-05T15:00:00.000Z',
        },
      },
      addNotes: {
        summary: 'Add notes',
        description: 'Add or update notes for the service order',
        value: {
          notes:
            'Diagnostic scan completed. Found oil leak in valve cover gasket. Parts ordered and scheduled for replacement.',
        },
      },
      cancelOrder: {
        summary: 'Cancel order',
        description: 'Cancel the service order with a reason',
        value: {
          status: 'CANCELLED',
          cancellationReason: 'Customer declined service due to cost concerns',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Service order updated successfully',
    type: ServiceOrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid service order data or validation errors',
  })
  @ApiResponse({
    status: 404,
    description: 'Service order not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceOrderDto,
  ): Promise<ServiceOrderResponseDto> {
    const result = await this.updateServiceOrderUseCase.execute(id, dto)
    return result.isSuccess
      ? result.value
      : (() => {
          throw result.error
        })()
  }

  /**
   * Delete a service order by its unique identifier.
   * @param id - The unique identifier of the service order
   * @returns Promise resolving to void
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a service order',
    description: 'Delete an existing service order. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Service order unique identifier',
    example: 'so-1704067200000-abc123def',
  })
  @ApiResponse({
    status: 204,
    description: 'Service order deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service order not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    try {
      const result = await this.deleteServiceOrderUseCase.execute(id)

      if (result.isFailure) {
        throw result.error
      }
    } catch (error) {
      this.logger.error(`Error deleting service order ${id}:`, error)
      throw error
    }
  }
}

import { Controller, Get, Param, Query, Logger, UseGuards, Post, Body } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

import { PaginatedServiceExecutionsResponseDto } from '@application/service-executions/dto'
import { GetServiceExecutionsByServiceOrderUseCase } from '@application/service-executions/use-cases'
import {
  PaginatedServiceOrdersResponseDto,
  CreateServiceOrderDto,
  ServiceOrderResponseDto,
} from '@application/service-orders/dto'
import {
  CreateServiceOrderUseCase,
  GetServiceOrderByIdUseCase,
  GetServiceOrdersByClientIdUseCase,
} from '@application/service-orders/use-cases'
import { paginationQuery, Roles, ClientAccess } from '@shared/decorators'
import { PaginationQueryDto } from '@shared/dto'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'
import { ResultHelper } from '@shared/utils'

/**
 * Client Portal Service Orders Controller
 * Provides endpoints for clients to track their service orders
 */
@ApiTags('Client Portal - Service Orders')
@Controller('client-portal/service-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientServiceOrdersController {
  private readonly logger = new Logger(ClientServiceOrdersController.name)

  /**
   * Creates a new instance of ClientServiceOrdersController
   * @param createServiceOrderUseCase - Use case for creating service orders
   * @param getServiceOrderByIdUseCase - Use case for getting service order by ID
   * @param getServiceOrdersByClientIdUseCase - Use case for getting service orders by client ID
   * @param getServiceExecutionsByServiceOrderUseCase - Use case for getting service executions by service order
   */
  constructor(
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
    private readonly getServiceOrderByIdUseCase: GetServiceOrderByIdUseCase,
    private readonly getServiceOrdersByClientIdUseCase: GetServiceOrdersByClientIdUseCase,
    private readonly getServiceExecutionsByServiceOrderUseCase: GetServiceExecutionsByServiceOrderUseCase,
  ) {}

  /**
   * Request a new service order (creates with REQUESTED status)
   * @param clientId - Client identifier (validated by ClientAccess decorator)
   * @param createServiceOrderDto - Service order request data
   * @returns Created service order with REQUESTED status
   */
  @Post('client/:clientId/request')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Request a new service order',
    description:
      'Create a new service order request with REQUESTED status. Only employees can mark it as RECEIVED.',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'Client ID' })
  @ApiBody({
    type: CreateServiceOrderDto,
    description: 'Service order request data',
    examples: {
      basic: {
        summary: 'Basic service order request',
        description: 'Create a service order request with minimal required data',
        value: {
          vehicleId: 'vehicle-4567890123-def456ghi',
        },
      },
      withNotes: {
        summary: 'Service order request with notes',
        description: 'Create a service order request with additional notes',
        value: {
          vehicleId: 'vehicle-4567890123-def456ghi',
          notes: 'Engine making strange noise, needs diagnostic',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Service order request created successfully',
    type: ServiceOrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid service order data or validation errors',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found or vehicle does not belong to client',
  })
  async requestServiceOrder(
    @ClientAccess() clientId: string,
    @Body() createServiceOrderDto: CreateServiceOrderDto,
  ): Promise<ServiceOrderResponseDto> {
    try {
      this.logger.log(
        `Client ${clientId} requesting service order for vehicle ${createServiceOrderDto.vehicleId}`,
      )

      // TODO: Validate that the vehicle belongs to the client
      // This should be implemented in the service layer

      return ResultHelper.unwrapOrThrow(
        await this.createServiceOrderUseCase.execute(createServiceOrderDto),
      )
    } catch (error) {
      this.logger.error(`Error creating service order request for client ${clientId}:`, error)
      throw error
    }
  }

  /**
   * Get all service orders for a specific client
   * @param clientId - Client identifier
   * @param pagination - Pagination parameters
   * @returns Paginated list of service orders
   */
  @Get('client/:clientId')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all service orders for a client',
    description: 'Retrieve all service orders associated with a specific client',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'Client ID' })
  @paginationQuery()
  @ApiResponse({
    status: 200,
    description: 'Service orders retrieved successfully',
    type: PaginatedServiceOrdersResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async getServiceOrdersByClient(
    @ClientAccess() clientId: string,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedServiceOrdersResponseDto> {
    this.logger.log(`Getting service orders for client ${clientId}`)
    return ResultHelper.unwrapOrThrow(
      await this.getServiceOrdersByClientIdUseCase.execute(
        clientId,
        pagination.page,
        pagination.limit,
      ),
    )
  }

  /**
   * Get a specific service order with its details
   * @param clientId - Client identifier (validated by ClientAccess decorator)
   * @param serviceOrderId - Service order identifier
   * @returns Service order details
   */
  @Get('client/:clientId/service-order/:serviceOrderId')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service order by ID',
    description: 'Retrieve a specific service order by its unique identifier',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'Client ID' })
  @ApiParam({ name: 'serviceOrderId', type: String, description: 'Service Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Service order retrieved successfully',
    type: Object, // TODO: Add proper DTO type
  })
  @ApiResponse({
    status: 404,
    description: 'Service order not found',
  })
  async getServiceOrder(
    @ClientAccess() clientId: string,
    @Param('serviceOrderId') serviceOrderId: string,
  ): Promise<unknown> {
    this.logger.log(`Getting service order ${serviceOrderId} for client ${clientId}`)
    return ResultHelper.unwrapOrThrow(await this.getServiceOrderByIdUseCase.execute(serviceOrderId))
  }

  /**
   * Get service executions for a specific service order
   * @param clientId - Client identifier (validated by ClientAccess decorator)
   * @param serviceOrderId - Service order identifier
   * @param pagination - Pagination parameters
   * @returns Paginated list of service executions
   */
  @Get('client/:clientId/service-order/:serviceOrderId/executions')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service executions for a service order',
    description: 'Retrieve all service executions for a specific service order',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'Client ID' })
  @ApiParam({ name: 'serviceOrderId', type: String, description: 'Service Order ID' })
  @paginationQuery()
  @ApiResponse({
    status: 200,
    description: 'Service executions retrieved successfully',
    type: PaginatedServiceExecutionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service order not found',
  })
  async getServiceExecutions(
    @ClientAccess() clientId: string,
    @Param('serviceOrderId') serviceOrderId: string,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedServiceExecutionsResponseDto> {
    this.logger.log(
      `Getting service executions for service order ${serviceOrderId} for client ${clientId}`,
    )
    return ResultHelper.unwrapOrThrow(
      await this.getServiceExecutionsByServiceOrderUseCase.execute(
        serviceOrderId,
        pagination.page,
        pagination.limit,
      ),
    )
  }

  /**
   * Get service order progress summary
   * @param clientId - Client identifier (validated by ClientAccess decorator)
   * @param serviceOrderId - Service order identifier
   * @returns Service order progress summary
   */
  @Get('client/:clientId/service-order/:serviceOrderId/progress')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service order progress summary',
    description: 'Get a summary of the progress for a specific service order',
  })
  @ApiParam({ name: 'clientId', type: String, description: 'Client ID' })
  @ApiParam({ name: 'serviceOrderId', type: String, description: 'Service Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Service order progress retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        serviceOrderId: { type: 'string' },
        status: { type: 'string' },
        progress: { type: 'number' },
        estimatedCompletion: { type: 'string' },
        lastUpdate: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Service order not found',
  })
  async getServiceOrderProgress(
    @ClientAccess() clientId: string,
    @Param('serviceOrderId') serviceOrderId: string,
  ): Promise<{
    serviceOrderId: string
    status: string
    progress: number
    estimatedCompletion: string | null
    lastUpdate: string
  }> {
    this.logger.log(`Getting progress for service order ${serviceOrderId} for client ${clientId}`)

    // TODO: Implement proper progress calculation
    // For now, return a basic structure
    const serviceOrderResult = await this.getServiceOrderByIdUseCase.execute(serviceOrderId)
    if (!serviceOrderResult.isSuccess) {
      throw serviceOrderResult.error
    }
    const serviceOrder = serviceOrderResult.value

    return {
      serviceOrderId,
      status: serviceOrder.status,
      progress: 0, // TODO: Calculate based on service executions
      estimatedCompletion: null, // TODO: Calculate based on service executions
      lastUpdate: new Date().toISOString(),
    }
  }
}

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
  CreateServiceExecutionDto,
  UpdateServiceExecutionDto,
  ServiceExecutionResponseDto,
  PaginatedServiceExecutionsResponseDto,
} from '@application/service-executions/dto'
import {
  AssignMechanicUseCase,
  CompleteServiceExecutionUseCase,
  CreateServiceExecutionUseCase,
  DeleteServiceExecutionUseCase,
  GetAllServiceExecutionsUseCase,
  GetServiceExecutionByIdUseCase,
  GetServiceExecutionsByMechanicUseCase,
  GetServiceExecutionsByServiceOrderUseCase,
  StartServiceExecutionUseCase,
  UpdateServiceExecutionUseCase,
  UpdateServiceExecutionNotesUseCase,
} from '@application/service-executions/use-cases'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * REST controller for service execution operations
 * Handles HTTP requests and responses for service execution management
 */
@ApiTags('Service Executions')
@Controller('service-executions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServiceExecutionController {
  private readonly logger = new Logger(ServiceExecutionController.name)

  /**
   * Constructor for ServiceExecutionController
   * @param createServiceExecutionUseCase - Create service execution use case
   * @param getAllServiceExecutionsUseCase - Get all service executions use case
   * @param getServiceExecutionByIdUseCase - Get service execution by ID use case
   * @param updateServiceExecutionUseCase - Update service execution use case
   * @param deleteServiceExecutionUseCase - Delete service execution use case
   * @param assignMechanicUseCase - Assign mechanic use case
   * @param startServiceExecutionUseCase - Start service execution use case
   * @param completeServiceExecutionUseCase - Complete service execution use case
   * @param updateServiceExecutionNotesUseCase - Update service execution notes use case
   * @param getServiceExecutionsByServiceOrderUseCase - Get service executions by service order use case
   * @param getServiceExecutionsByMechanicUseCase - Get service executions by mechanic use case
   */
  constructor(
    private readonly createServiceExecutionUseCase: CreateServiceExecutionUseCase,
    private readonly getAllServiceExecutionsUseCase: GetAllServiceExecutionsUseCase,
    private readonly getServiceExecutionByIdUseCase: GetServiceExecutionByIdUseCase,
    private readonly updateServiceExecutionUseCase: UpdateServiceExecutionUseCase,
    private readonly deleteServiceExecutionUseCase: DeleteServiceExecutionUseCase,
    private readonly assignMechanicUseCase: AssignMechanicUseCase,
    private readonly startServiceExecutionUseCase: StartServiceExecutionUseCase,
    private readonly completeServiceExecutionUseCase: CompleteServiceExecutionUseCase,
    private readonly updateServiceExecutionNotesUseCase: UpdateServiceExecutionNotesUseCase,
    private readonly getServiceExecutionsByServiceOrderUseCase: GetServiceExecutionsByServiceOrderUseCase,
    private readonly getServiceExecutionsByMechanicUseCase: GetServiceExecutionsByMechanicUseCase,
  ) {}

  /**
   * Create a new service execution
   * @param createServiceExecutionDto - Service execution data to create
   * @returns Promise resolving to the service execution response
   */
  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create service execution',
    description: 'Create a new service execution with the provided data',
  })
  @ApiBody({
    type: CreateServiceExecutionDto,
    description: 'Service execution data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Service execution created successfully',
    type: ServiceExecutionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid service execution data',
  })
  async createServiceExecution(
    @Body() createServiceExecutionDto: CreateServiceExecutionDto,
  ): Promise<ServiceExecutionResponseDto> {
    const result = await this.createServiceExecutionUseCase.execute(createServiceExecutionDto)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error('Error creating service execution:', result.error)
    throw result.error
  }

  /**
   * Get all service executions with pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated service execution list
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all service executions',
    description: 'Get paginated list of all service executions',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Service executions retrieved successfully',
    type: PaginatedServiceExecutionsResponseDto,
  })
  async getAllServiceExecutions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedServiceExecutionsResponseDto> {
    const result = await this.getAllServiceExecutionsUseCase.execute(page, limit)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error('Error getting all service executions:', result.error)
    throw result.error
  }

  /**
   * Get service executions by service order ID
   * @param serviceOrderId - Service order ID
   * @returns Promise resolving to paginated service execution list
   */
  @Get('service-order/:serviceOrderId')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service executions by service order',
    description: 'Get all service executions for a specific service order',
  })
  @ApiParam({
    name: 'serviceOrderId',
    type: 'string',
    description: 'Service order unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Service executions retrieved successfully',
    type: PaginatedServiceExecutionsResponseDto,
  })
  async getServiceExecutionsByServiceOrder(
    @Param('serviceOrderId') serviceOrderId: string,
  ): Promise<PaginatedServiceExecutionsResponseDto> {
    const result = await this.getServiceExecutionsByServiceOrderUseCase.execute(serviceOrderId)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(
      `Error getting service executions by service order ${serviceOrderId}:`,
      result.error,
    )
    throw result.error
  }

  /**
   * Get service executions by mechanic ID
   * @param mechanicId - Mechanic ID
   * @returns Promise resolving to service execution list
   */
  @Get('mechanic/:mechanicId')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service executions by mechanic',
    description: 'Get all service executions assigned to a specific mechanic',
  })
  @ApiParam({
    name: 'mechanicId',
    type: 'string',
    description: 'Mechanic unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Service executions retrieved successfully',
    type: [ServiceExecutionResponseDto],
  })
  async getServiceExecutionsByMechanic(
    @Param('mechanicId') mechanicId: string,
  ): Promise<ServiceExecutionResponseDto[]> {
    const result = await this.getServiceExecutionsByMechanicUseCase.execute(mechanicId)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error getting service executions by mechanic ${mechanicId}:`, result.error)
    throw result.error
  }

  /**
   * Get service execution by ID
   * @param id - Service execution ID
   * @returns Promise resolving to the service execution response
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service execution by ID',
    description: 'Get a specific service execution by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Service execution unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Service execution retrieved successfully',
    type: ServiceExecutionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service execution not found',
  })
  async getServiceExecutionById(@Param('id') id: string): Promise<ServiceExecutionResponseDto> {
    const result = await this.getServiceExecutionByIdUseCase.execute(id)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error getting service execution ${id}:`, result.error)
    throw result.error
  }

  /**
   * Update service execution
   * @param id - Service execution ID
   * @param updateServiceExecutionDto - Update service execution data
   * @returns Promise resolving to the updated service execution response
   */
  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update service execution',
    description: 'Update an existing service execution with new data',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Service execution unique identifier',
  })
  @ApiBody({
    type: UpdateServiceExecutionDto,
    description: 'Service execution data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Service execution updated successfully',
    type: ServiceExecutionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service execution not found',
  })
  async updateServiceExecution(
    @Param('id') id: string,
    @Body() updateServiceExecutionDto: UpdateServiceExecutionDto,
  ): Promise<ServiceExecutionResponseDto> {
    const result = await this.updateServiceExecutionUseCase.execute(id, updateServiceExecutionDto)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error updating service execution ${id}:`, result.error)
    throw result.error
  }

  /**
   * Assign mechanic to service execution
   * @param id - Service execution ID
   * @param mechanicId - Mechanic ID
   * @returns Promise resolving to the updated service execution response
   */
  @Put(':id/assign-mechanic/:mechanicId')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign mechanic to service execution',
    description: 'Assign a mechanic to perform the service execution',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Service execution unique identifier',
  })
  @ApiParam({
    name: 'mechanicId',
    type: 'string',
    description: 'Mechanic unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Mechanic assigned successfully',
    type: ServiceExecutionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service execution not found',
  })
  async assignMechanic(
    @Param('id') id: string,
    @Param('mechanicId') mechanicId: string,
  ): Promise<ServiceExecutionResponseDto> {
    const result = await this.assignMechanicUseCase.execute(id, mechanicId)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(
      `Error assigning mechanic ${mechanicId} to service execution ${id}:`,
      result.error,
    )
    throw result.error
  }

  /**
   * Start service execution
   * @param id - Service execution ID
   * @returns Promise resolving to the updated service execution response
   */
  @Put(':id/start')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Start service execution',
    description: 'Start the execution of a service',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Service execution unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Service execution started successfully',
    type: ServiceExecutionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service execution not found',
  })
  async startServiceExecution(@Param('id') id: string): Promise<ServiceExecutionResponseDto> {
    const result = await this.startServiceExecutionUseCase.execute(id)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error starting service execution ${id}:`, result.error)
    throw result.error
  }

  /**
   * Complete service execution
   * @param id - Service execution ID
   * @param notes - Completion notes
   * @returns Promise resolving to the updated service execution response
   */
  @Put(':id/complete')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Complete service execution',
    description: 'Mark a service execution as completed with optional notes',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Service execution unique identifier',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: {
          type: 'string',
          description: 'Completion notes',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Service execution completed successfully',
    type: ServiceExecutionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service execution not found',
  })
  async completeServiceExecution(
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<ServiceExecutionResponseDto> {
    const result = await this.completeServiceExecutionUseCase.execute(id, notes)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error completing service execution ${id}:`, result.error)
    throw result.error
  }

  /**
   * Update service execution notes
   * @param id - Service execution ID
   * @param notes - New notes
   * @returns Promise resolving to the updated service execution response
   */
  @Put(':id/notes')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update service execution notes',
    description: 'Update the notes for a service execution',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Service execution unique identifier',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: {
          type: 'string',
          description: 'New notes',
        },
      },
      required: ['notes'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Service execution notes updated successfully',
    type: ServiceExecutionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service execution not found',
  })
  async updateServiceExecutionNotes(
    @Param('id') id: string,
    @Body('notes') notes: string,
  ): Promise<ServiceExecutionResponseDto> {
    const result = await this.updateServiceExecutionNotesUseCase.execute(id, notes)

    if (result.isSuccess) {
      return result.value
    }

    this.logger.error(`Error updating service execution notes ${id}:`, result.error)
    throw result.error
  }

  /**
   * Delete service execution
   * @param id - Service execution ID to delete
   * @returns Promise resolving to void
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete service execution',
    description: 'Delete a service execution by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Service execution unique identifier',
  })
  @ApiResponse({
    status: 204,
    description: 'Service execution deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service execution not found',
  })
  async deleteServiceExecution(@Param('id') id: string): Promise<void> {
    const result = await this.deleteServiceExecutionUseCase.execute(id)

    if (result.isSuccess) {
      return
    }

    this.logger.error(`Error deleting service execution ${id}:`, result.error)
    throw result.error
  }
}

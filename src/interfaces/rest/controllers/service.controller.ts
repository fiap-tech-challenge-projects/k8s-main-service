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
  ServiceResponseDto,
  CreateServiceDto,
  PaginatedServicesResponseDto,
  UpdateServiceDto,
  CreateServiceUseCase,
  GetAllServicesUseCase,
  GetServiceByIdUseCase,
  SearchServicesByNameUseCase,
  UpdateServiceUseCase,
  DeleteServiceUseCase,
} from '@application/services'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * REST controller for managing services
 * Handles HTTP requests and responses for client management
 */
@ApiTags('Services')
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServiceController {
  private readonly logger = new Logger(ServiceController.name)

  /**
   * Constructor for ServiceController
   * @param createServiceUseCase - Create service use case
   * @param getAllServicesUseCase - Get all services use case
   * @param getServiceByIdUseCase - Get service by ID use case
   * @param searchServicesByNameUseCase - Search services by name use case
   * @param updateServiceUseCase - Update service use case
   * @param deleteServiceUseCase - Delete service use case
   */
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly getAllServicesUseCase: GetAllServicesUseCase,
    private readonly getServiceByIdUseCase: GetServiceByIdUseCase,
    private readonly searchServicesByNameUseCase: SearchServicesByNameUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
  ) {}

  /**
   * Get all services with pagination
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @param createServiceDto - Data for creating a new service
   * @returns Paginated list of services
   */
  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create service',
    description: 'Create a new service with the provided data',
  })
  @ApiBody({
    type: CreateServiceDto,
    description: 'Service data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid service data',
  })
  @ApiResponse({
    status: 409,
    description: 'name already registred',
  })
  async createService(@Body() createServiceDto: CreateServiceDto): Promise<ServiceResponseDto> {
    try {
      const result = await this.createServiceUseCase.execute(createServiceDto)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error creating service: ${message}`)
      const toThrow = error instanceof Error ? error : new Error(message)
      throw toThrow
    }
  }

  /**
   * Search clients by name with pagination
   * @param name - Name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated client responses
   */
  @Get('search/:name')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Search services by name',
    description: 'Search for services by name with pagination',
  })
  @ApiParam({
    name: 'name',
    description: 'Name to search for',
    example: 'Troca de oleo',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: PaginatedServicesResponseDto,
  })
  async searchServicesByName(
    @Param('name') name: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedServicesResponseDto> {
    try {
      const result = await this.searchServicesByNameUseCase.execute(name, page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error searching services by name ${name}: ${message}`)
      const safePage = typeof page === 'number' ? page : 1
      const safeLimit = typeof limit === 'number' ? limit : 10
      return {
        data: [],
        meta: {
          total: 0,
          page: safePage,
          limit: safeLimit,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }
    }
  }
  /**
   * Get all services with pagination
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Paginated list of services
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all services',
    description: 'Retrieve a paginated list of all services',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of services retrieved successfully',
    type: PaginatedServicesResponseDto,
  })
  async getAllServices(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedServicesResponseDto> {
    try {
      const result = await this.getAllServicesUseCase.execute(page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error retrieving services: ${message}`)
      const toThrow = error instanceof Error ? error : new Error(message)
      throw toThrow
    }
  }

  /**
   * Get a service by ID
   * @param id - Service ID
   * @returns Service details
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get service by ID',
    description: 'Retrieve details of a specific service by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the service to retrieve',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Service details retrieved successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async getServiceById(@Param('id') id: string): Promise<ServiceResponseDto> {
    const result = await this.getServiceByIdUseCase.execute(id)

    if (result.isFailure) {
      throw result.error
    }

    return result.value
  }
  /**
   * Update a service by ID
   * @param id - Service ID
   * @param updateServiceDto - Data for updating the service
   * @returns Updated service details
   */
  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update service by ID',
    description: 'Update details of a specific service by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the service to update',
    example: '1',
  })
  @ApiBody({
    type: CreateServiceDto,
    description: 'Service data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid service data',
  })
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const result = await this.updateServiceUseCase.execute(id, updateServiceDto)

    if (result.isFailure) {
      throw result.error
    }

    return result.value
  }
  /**
   * Delete a service by ID
   * @param id - Service ID
   * @returns void
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete service by ID',
    description: 'Delete a specific service by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the service to delete',
    example: '1',
  })
  @ApiResponse({
    status: 204,
    description: 'Service deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async deleteService(@Param('id') id: string): Promise<void> {
    const result = await this.deleteServiceUseCase.execute(id)

    if (result.isFailure) {
      throw result.error
    }
  }
}

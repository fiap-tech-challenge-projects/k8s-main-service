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
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleResponseDto,
  PaginatedVehiclesResponseDto,
} from '@application/vehicles/dto'
import {
  CheckLicensePlateAvailabilityUseCase,
  CheckVinAvailabilityUseCase,
  CreateVehicleUseCase,
  DeleteVehicleUseCase,
  GetAllVehiclesUseCase,
  GetVehicleByIdUseCase,
  GetVehicleByLicensePlateUseCase,
  GetVehicleByVinUseCase,
  GetVehiclesByClientUseCase,
  SearchVehiclesByMakeModelUseCase,
  UpdateVehicleUseCase,
} from '@application/vehicles/use-cases'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * REST controller for vehicle operations
 * Handles HTTP requests and responses for vehicle management
 */
@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VehicleController {
  private readonly logger = new Logger(VehicleController.name)

  /**
   * Constructor for VehicleController
   * @param createVehicleUseCase - Create vehicle use case
   * @param getAllVehiclesUseCase - Get all vehicles use case
   * @param getVehicleByLicensePlateUseCase - Get vehicle by license plate use case
   * @param getVehicleByVinUseCase - Get vehicle by VIN use case
   * @param getVehiclesByClientUseCase - Get vehicles by client use case
   * @param searchVehiclesByMakeModelUseCase - Search vehicles by make and model use case
   * @param checkLicensePlateAvailabilityUseCase - Check license plate availability use case
   * @param checkVinAvailabilityUseCase - Check VIN availability use case
   * @param getVehicleByIdUseCase - Get vehicle by ID use case
   * @param updateVehicleUseCase - Update vehicle use case
   * @param deleteVehicleUseCase - Delete vehicle use case
   */
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly getAllVehiclesUseCase: GetAllVehiclesUseCase,
    private readonly getVehicleByLicensePlateUseCase: GetVehicleByLicensePlateUseCase,
    private readonly getVehicleByVinUseCase: GetVehicleByVinUseCase,
    private readonly getVehiclesByClientUseCase: GetVehiclesByClientUseCase,
    private readonly searchVehiclesByMakeModelUseCase: SearchVehiclesByMakeModelUseCase,
    private readonly checkLicensePlateAvailabilityUseCase: CheckLicensePlateAvailabilityUseCase,
    private readonly checkVinAvailabilityUseCase: CheckVinAvailabilityUseCase,
    private readonly getVehicleByIdUseCase: GetVehicleByIdUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  /**
   * Create a new vehicle
   * @param createVehicleDto - Vehicle data to create
   * @returns Promise resolving to the vehicle response
   */
  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create vehicle',
    description: 'Create a new vehicle with the provided data',
  })
  @ApiBody({
    type: CreateVehicleDto,
    description: 'Vehicle data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid vehicle data',
  })
  @ApiResponse({
    status: 409,
    description: 'License plate or VIN already registered',
  })
  async createVehicle(@Body() createVehicleDto: CreateVehicleDto): Promise<VehicleResponseDto> {
    try {
      const result = await this.createVehicleUseCase.execute(createVehicleDto)

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error creating vehicle:', error)
      throw error
    }
  }

  /**
   * Get all vehicles with pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated vehicle responses
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all vehicles',
    description: 'Retrieve all vehicles with optional pagination',
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
    description: 'Vehicles retrieved successfully',
    type: PaginatedVehiclesResponseDto,
  })
  async getAllVehicles(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedVehiclesResponseDto> {
    try {
      const result = await this.getAllVehiclesUseCase.execute(page, limit)

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error getting all vehicles:', error)
      throw error
    }
  }

  /**
   * Get vehicle by license plate
   * @param licensePlate - Vehicle license plate
   * @returns Promise resolving to the vehicle response
   */
  @Get('license-plate/:licensePlate')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicle by license plate',
    description: 'Retrieve a vehicle by its license plate',
  })
  @ApiParam({
    name: 'licensePlate',
    description: 'Vehicle license plate',
    example: 'ABC-1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle found successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async getVehicleByLicensePlate(
    @Param('licensePlate') licensePlate: string,
  ): Promise<VehicleResponseDto> {
    const result = await this.getVehicleByLicensePlateUseCase.execute(licensePlate)
    return result.isSuccess
      ? result.value
      : (() => {
          throw result.error
        })()
  }

  /**
   * Get vehicle by VIN
   * @param vin - Vehicle Identification Number
   * @returns Promise resolving to the vehicle response
   */
  @Get('vin/:vin')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicle by VIN',
    description: 'Retrieve a vehicle by its VIN',
  })
  @ApiParam({
    name: 'vin',
    description: 'Vehicle Identification Number',
    example: '1HGBH41JXMN109186',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle found successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async getVehicleByVin(@Param('vin') vin: string): Promise<VehicleResponseDto> {
    try {
      const result = await this.getVehicleByVinUseCase.execute(vin)

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error getting vehicle by VIN:', error)
      throw error
    }
  }

  /**
   * Get vehicles by client ID with pagination
   * @param clientId - Client ID
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated vehicle responses
   */
  @Get('client/:clientId')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicles by client ID',
    description: 'Retrieve all vehicles belonging to a specific client',
  })
  @ApiParam({
    name: 'clientId',
    description: 'Client ID',
    example: 'client-1234567890-abc123def',
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
    description: 'Vehicles retrieved successfully',
    type: PaginatedVehiclesResponseDto,
  })
  async getVehiclesByClient(
    @Param('clientId') clientId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedVehiclesResponseDto> {
    try {
      const result = await this.getVehiclesByClientUseCase.execute(clientId, page, limit)

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error getting vehicles by client:', error)
      throw error
    }
  }

  /**
   * Search vehicles by make and model with pagination
   * @param make Vehicle make/brand
   * @param model Vehicle model
   * @param year Vehicle year
   * @param page Page number (1-based)
   * @param limit Number of items per page
   * @returns Promise resolving to paginated vehicle responses
   */
  @Get('search/:make/:model')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Search vehicles by make and model',
    description: 'Search vehicles by make and model with pagination',
  })
  @ApiParam({
    name: 'make',
    description: 'Vehicle make/brand',
    example: 'Toyota',
  })
  @ApiParam({
    name: 'model',
    description: 'Vehicle model',
    example: 'Corolla',
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
    description: 'Vehicles found successfully',
    type: PaginatedVehiclesResponseDto,
  })
  async searchVehicles(
    @Param('make') make: string,
    @Param('model') model: string,
    @Query('year') year?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedVehiclesResponseDto> {
    try {
      const result = await this.searchVehiclesByMakeModelUseCase.execute(
        make,
        model,
        year,
        page,
        limit,
      )

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error searching vehicles by make and model:', error)
      throw error
    }
  }

  /**
   * Check license plate availability
   * @param licensePlate - License plate to check
   * @returns Promise resolving to availability status
   */
  @Get('license-plate/:licensePlate/availability')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check license plate availability',
    description: 'Check if a license plate is available for registration',
  })
  @ApiParam({
    name: 'licensePlate',
    description: 'License plate to check',
    example: 'ABC-1234',
  })
  @ApiResponse({
    status: 200,
    description: 'License plate availability checked successfully',
    schema: {
      type: 'object',
      properties: {
        available: {
          type: 'boolean',
          description: 'Whether the license plate is available',
        },
      },
    },
  })
  async checkLicensePlateAvailability(
    @Param('licensePlate') licensePlate: string,
  ): Promise<{ available: boolean }> {
    try {
      const result = await this.checkLicensePlateAvailabilityUseCase.execute(licensePlate)

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error checking license plate availability:', error)
      throw error
    }
  }

  /**
   * Check VIN availability
   * @param vin - VIN to check
   * @returns Promise resolving to availability status
   */
  @Get('vin/:vin/availability')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check VIN availability',
    description: 'Check if a VIN is available for registration',
  })
  @ApiParam({
    name: 'vin',
    description: 'VIN to check',
    example: '1HGBH41JXMN109186',
  })
  @ApiResponse({
    status: 200,
    description: 'VIN availability checked successfully',
    schema: {
      type: 'object',
      properties: {
        available: {
          type: 'boolean',
          description: 'Whether the VIN is available',
        },
      },
    },
  })
  async checkVinAvailability(@Param('vin') vin: string): Promise<{ available: boolean }> {
    try {
      const result = await this.checkVinAvailabilityUseCase.execute(vin)

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error checking VIN availability:', error)
      throw error
    }
  }

  /**
   * Get vehicle by ID
   * @param id - Vehicle unique identifier
   * @returns Promise resolving to the vehicle response
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicle by ID',
    description: 'Retrieve a vehicle by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Vehicle unique identifier',
    example: 'vehicle-1234567890-abc123def',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle found successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async getVehicleById(@Param('id') id: string): Promise<VehicleResponseDto> {
    try {
      const result = await this.getVehicleByIdUseCase.execute(id)

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error getting vehicle by ID:', error)
      throw error
    }
  }

  /**
   * Update an existing vehicle
   * @param id - Vehicle unique identifier
   * @param updateVehicleDto - Vehicle data to update
   * @returns Promise resolving to the updated vehicle response
   */
  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update vehicle',
    description: 'Update an existing vehicle with the provided data',
  })
  @ApiParam({
    name: 'id',
    description: 'Vehicle unique identifier',
    example: 'vehicle-1234567890-abc123def',
  })
  @ApiBody({
    type: UpdateVehicleDto,
    description: 'Vehicle data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid vehicle data',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  @ApiResponse({
    status: 409,
    description: 'License plate or VIN already registered',
  })
  async updateVehicle(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    try {
      const result = await this.updateVehicleUseCase.execute(id, updateVehicleDto)

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error updating vehicle:', error)
      throw error
    }
  }

  /**
   * Delete a vehicle by ID
   * @param id - Vehicle unique identifier
   * @returns Promise resolving to void
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete vehicle',
    description: 'Delete a vehicle by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Vehicle unique identifier',
    example: 'vehicle-1234567890-abc123def',
  })
  @ApiResponse({
    status: 204,
    description: 'Vehicle deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async deleteVehicle(@Param('id') id: string): Promise<boolean> {
    try {
      const result = await this.deleteVehicleUseCase.execute(id)

      if (result.isSuccess) {
        return result.value
      } else {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error deleting vehicle:', error)
      throw error
    }
  }
}

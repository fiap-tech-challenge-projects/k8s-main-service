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
  CreateVehicleEvaluationDto,
  UpdateVehicleEvaluationDto,
  VehicleEvaluationResponseDto,
  PaginatedVehicleEvaluationsResponseDto,
} from '@application/vehicle-evaluations/dto'
import {
  CreateVehicleEvaluationUseCase,
  DeleteVehicleEvaluationUseCase,
  GetAllVehicleEvaluationsUseCase,
  GetVehicleEvaluationByIdUseCase,
  GetVehicleEvaluationByServiceOrderIdUseCase,
  GetVehicleEvaluationsByVehicleIdUseCase,
  UpdateVehicleEvaluationUseCase,
  UpdateVehicleEvaluationDetailsUseCase,
  UpdateVehicleEvaluationMechanicNotesUseCase,
} from '@application/vehicle-evaluations/use-cases'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * REST controller for vehicle evaluation operations
 * Handles HTTP requests and responses for vehicle evaluation management
 */
@ApiTags('Vehicle Evaluations')
@Controller('vehicle-evaluations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VehicleEvaluationController {
  private readonly logger = new Logger(VehicleEvaluationController.name)

  /**
   * Constructor for VehicleEvaluationController
   * @param createVehicleEvaluationUseCase Use case for creating vehicle evaluations
   * @param deleteVehicleEvaluationUseCase Use case for deleting vehicle evaluations
   * @param getAllVehicleEvaluationsUseCase Use case for retrieving all vehicle evaluations
   * @param getVehicleEvaluationByIdUseCase Use case for retrieving vehicle evaluations by ID
   * @param getVehicleEvaluationByServiceOrderIdUseCase Use case for retrieving vehicle evaluations by service order ID
   * @param getVehicleEvaluationsByVehicleIdUseCase Use case for retrieving vehicle evaluations by vehicle ID
   * @param updateVehicleEvaluationUseCase Use case for updating vehicle evaluations
   * @param updateVehicleEvaluationDetailsUseCase Use case for updating vehicle evaluation details
   * @param updateVehicleEvaluationMechanicNotesUseCase Use case for updating vehicle evaluation mechanic notes
   */
  constructor(
    private readonly createVehicleEvaluationUseCase: CreateVehicleEvaluationUseCase,
    private readonly deleteVehicleEvaluationUseCase: DeleteVehicleEvaluationUseCase,
    private readonly getAllVehicleEvaluationsUseCase: GetAllVehicleEvaluationsUseCase,
    private readonly getVehicleEvaluationByIdUseCase: GetVehicleEvaluationByIdUseCase,
    private readonly getVehicleEvaluationByServiceOrderIdUseCase: GetVehicleEvaluationByServiceOrderIdUseCase,
    private readonly getVehicleEvaluationsByVehicleIdUseCase: GetVehicleEvaluationsByVehicleIdUseCase,
    private readonly updateVehicleEvaluationUseCase: UpdateVehicleEvaluationUseCase,
    private readonly updateVehicleEvaluationDetailsUseCase: UpdateVehicleEvaluationDetailsUseCase,
    private readonly updateVehicleEvaluationMechanicNotesUseCase: UpdateVehicleEvaluationMechanicNotesUseCase,
  ) {}

  /**
   * Create a new vehicle evaluation
   * @param createVehicleEvaluationDto Vehicle evaluation data to create
   * @returns Promise resolving to created vehicle evaluation data
   */
  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create vehicle evaluation',
    description: 'Create a new vehicle evaluation with the provided data',
  })
  @ApiBody({
    type: CreateVehicleEvaluationDto,
    description: 'Vehicle evaluation data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Vehicle evaluation created successfully',
    type: VehicleEvaluationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid vehicle evaluation data',
  })
  async createVehicleEvaluation(
    @Body() createVehicleEvaluationDto: CreateVehicleEvaluationDto,
  ): Promise<VehicleEvaluationResponseDto> {
    const result = await this.createVehicleEvaluationUseCase.execute(createVehicleEvaluationDto)

    if (result.isFailure) {
      this.logger.error('Error creating vehicle evaluation:', result.error)
      throw result.error
    }

    return result.value
  }

  /**
   * Get all vehicle evaluations with pagination
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Promise resolving to paginated vehicle evaluation list
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all vehicle evaluations',
    description: 'Retrieve all vehicle evaluations with optional pagination',
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
    description: 'Vehicle evaluations retrieved successfully',
    type: PaginatedVehicleEvaluationsResponseDto,
  })
  async getAllVehicleEvaluations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedVehicleEvaluationsResponseDto> {
    const result = await this.getAllVehicleEvaluationsUseCase.execute(page, limit)

    if (result.isFailure) {
      this.logger.error('Error getting all vehicle evaluations:', result.error)
      throw result.error
    }

    return result.value
  }

  /**
   * Get vehicle evaluation by service order ID
   * @param serviceOrderId Service order ID
   * @returns Promise resolving to vehicle evaluation data
   */
  @Get('service-order/:serviceOrderId')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicle evaluation by service order ID',
    description: 'Retrieve a vehicle evaluation by its service order ID',
  })
  @ApiParam({
    name: 'serviceOrderId',
    description: 'The service order ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle evaluation retrieved successfully',
    type: VehicleEvaluationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle evaluation not found',
  })
  async getVehicleEvaluationByServiceOrderId(
    @Param('serviceOrderId') serviceOrderId: string,
  ): Promise<VehicleEvaluationResponseDto> {
    const result = await this.getVehicleEvaluationByServiceOrderIdUseCase.execute(serviceOrderId)

    if (result.isFailure) {
      this.logger.error('Error getting vehicle evaluation by service order ID:', result.error)
      throw result.error
    }

    return result.value
  }

  /**
   * Get vehicle evaluations by vehicle ID
   * @param vehicleId Vehicle ID
   * @returns Promise resolving to vehicle evaluation list
   */
  @Get('vehicle/:vehicleId')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicle evaluations by vehicle ID',
    description: 'Retrieve all vehicle evaluations for a specific vehicle',
  })
  @ApiParam({
    name: 'vehicleId',
    description: 'The vehicle ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle evaluations retrieved successfully',
    type: [VehicleEvaluationResponseDto],
  })
  async getVehicleEvaluationsByVehicleId(
    @Param('vehicleId') vehicleId: string,
  ): Promise<VehicleEvaluationResponseDto[]> {
    const result = await this.getVehicleEvaluationsByVehicleIdUseCase.execute(vehicleId)

    if (result.isFailure) {
      this.logger.error(`Error getting vehicle evaluations for vehicle ${vehicleId}:`, result.error)
      throw result.error
    }

    return result.value
  }

  /**
   * Get vehicle evaluation by ID
   * @param id Vehicle evaluation ID
   * @returns Promise resolving to vehicle evaluation data
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicle evaluation by ID',
    description: 'Retrieve a specific vehicle evaluation by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'The vehicle evaluation ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle evaluation retrieved successfully',
    type: VehicleEvaluationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle evaluation not found',
  })
  async getVehicleEvaluationById(@Param('id') id: string): Promise<VehicleEvaluationResponseDto> {
    const result = await this.getVehicleEvaluationByIdUseCase.execute(id)

    if (result.isFailure) {
      this.logger.error(`Error getting vehicle evaluation ${id}:`, result.error)
      throw result.error
    }

    return result.value
  }

  /**
   * Update vehicle evaluation
   * @param id Vehicle evaluation ID
   * @param updateVehicleEvaluationDto Vehicle evaluation data to update
   * @returns Promise resolving to updated vehicle evaluation data
   */
  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update vehicle evaluation',
    description: 'Update a vehicle evaluation with new data',
  })
  @ApiParam({
    name: 'id',
    description: 'The vehicle evaluation ID',
    type: 'string',
  })
  @ApiBody({
    type: UpdateVehicleEvaluationDto,
    description: 'Vehicle evaluation data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle evaluation updated successfully',
    type: VehicleEvaluationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle evaluation not found',
  })
  async updateVehicleEvaluation(
    @Param('id') id: string,
    @Body() updateVehicleEvaluationDto: UpdateVehicleEvaluationDto,
  ): Promise<VehicleEvaluationResponseDto> {
    const result = await this.updateVehicleEvaluationUseCase.execute(id, updateVehicleEvaluationDto)

    if (result.isFailure) {
      this.logger.error(`Error updating vehicle evaluation ${id}:`, result.error)
      throw result.error
    }

    return result.value
  }

  /**
   * Update vehicle evaluation details
   * @param id Vehicle evaluation ID
   * @param details Vehicle evaluation details to update
   * @returns Promise resolving to updated vehicle evaluation data
   */
  @Put(':id/details')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update vehicle evaluation details',
    description: 'Update the details of a vehicle evaluation',
  })
  @ApiParam({
    name: 'id',
    description: 'The vehicle evaluation ID',
    type: 'string',
  })
  @ApiBody({
    description: 'Details object to update',
    schema: {
      type: 'object',
      properties: {
        details: {
          type: 'object',
          description: 'Details object with dynamic properties',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle evaluation details updated successfully',
    type: VehicleEvaluationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle evaluation not found',
  })
  async updateVehicleEvaluationDetails(
    @Param('id') id: string,
    @Body('details') details: Record<string, unknown>,
  ): Promise<VehicleEvaluationResponseDto> {
    const result = await this.updateVehicleEvaluationDetailsUseCase.execute(id, details)

    if (result.isFailure) {
      this.logger.error(`Error updating details for vehicle evaluation ${id}:`, result.error)
      throw result.error
    }

    return result.value
  }

  /**
   * Update vehicle evaluation mechanic notes
   * @param id Vehicle evaluation ID
   * @param notes Mechanic notes to update
   * @returns Promise resolving to updated vehicle evaluation data
   */
  @Put(':id/mechanic-notes')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update vehicle evaluation mechanic notes',
    description: 'Update the mechanic notes of a vehicle evaluation',
  })
  @ApiParam({
    name: 'id',
    description: 'The vehicle evaluation ID',
    type: 'string',
  })
  @ApiBody({
    description: 'Mechanic notes to update',
    schema: {
      type: 'object',
      properties: {
        notes: {
          type: 'string',
          description: 'Mechanic notes',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle evaluation mechanic notes updated successfully',
    type: VehicleEvaluationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle evaluation not found',
  })
  async updateVehicleEvaluationMechanicNotes(
    @Param('id') id: string,
    @Body('notes') notes: string,
  ): Promise<VehicleEvaluationResponseDto> {
    const result = await this.updateVehicleEvaluationMechanicNotesUseCase.execute(id, notes)

    if (result.isFailure) {
      this.logger.error(`Error updating mechanic notes for vehicle evaluation ${id}:`, result.error)
      throw result.error
    }

    return result.value
  }

  /**
   * Delete vehicle evaluation
   * @param id Vehicle evaluation ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete vehicle evaluation',
    description: 'Delete a vehicle evaluation by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'The vehicle evaluation ID',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Vehicle evaluation deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle evaluation not found',
  })
  async deleteVehicleEvaluation(@Param('id') id: string): Promise<void> {
    const result = await this.deleteVehicleEvaluationUseCase.execute(id)

    if (result.isFailure) {
      this.logger.error(`Error deleting vehicle evaluation ${id}:`, result.error)
      throw result.error
    }
  }
}

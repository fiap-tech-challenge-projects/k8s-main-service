import { Injectable, Logger, Inject } from '@nestjs/common'

import { CreateVehicleDto, VehicleResponseDto } from '@application/vehicles/dto'
import { VehicleMapper } from '@application/vehicles/mappers'
import { Vehicle } from '@domain/vehicles/entities'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for creating a new vehicle
 * Handles the orchestration for vehicle creation business process
 */
@Injectable()
export class CreateVehicleUseCase {
  private readonly logger = new Logger(CreateVehicleUseCase.name)

  /**
   * Constructor for CreateVehicleUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute vehicle creation
   * @param createVehicleDto - Vehicle creation data
   * @returns Result with vehicle response DTO or error
   */
  async execute(
    createVehicleDto: CreateVehicleDto,
  ): Promise<Result<VehicleResponseDto, DomainException>> {
    this.logger.log('Executing create vehicle use case', {
      licensePlate: createVehicleDto.licensePlate,
      make: createVehicleDto.make,
      model: createVehicleDto.model,
      context: 'CreateVehicleUseCase.execute',
    })

    try {
      // Create Vehicle entity
      const vehicle = Vehicle.create(
        createVehicleDto.licensePlate,
        createVehicleDto.make,
        createVehicleDto.model,
        createVehicleDto.year,
        createVehicleDto.clientId,
        createVehicleDto.vin,
        createVehicleDto.color,
      )

      // Save to repository
      const savedVehicle = await this.vehicleRepository.create(vehicle)

      const result = VehicleMapper.toResponseDto(savedVehicle)

      this.logger.log('Vehicle creation use case completed successfully', {
        vehicleId: result.id,
        licensePlate: result.licensePlate,
        make: result.make,
        model: result.model,
        context: 'CreateVehicleUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Vehicle creation use case failed', {
        licensePlate: createVehicleDto.licensePlate,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'CreateVehicleUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException('Failed to create vehicle', JSON.stringify(createVehicleDto)),
      )
    }
  }
}

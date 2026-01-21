import { Injectable, Logger, Inject } from '@nestjs/common'

import { UpdateVehicleDto, VehicleResponseDto } from '@application/vehicles/dto'
import { VehicleMapper } from '@application/vehicles/mappers'
import { VehicleNotFoundException } from '@domain/vehicles/exceptions'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for updating a vehicle
 * Handles the orchestration for vehicle update business process
 */
@Injectable()
export class UpdateVehicleUseCase {
  private readonly logger = new Logger(UpdateVehicleUseCase.name)

  /**
   * Constructor for UpdateVehicleUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute vehicle update
   * @param id - Vehicle ID to update
   * @param updateVehicleDto - Vehicle update data
   * @returns Result with vehicle response DTO or error
   */
  async execute(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Result<VehicleResponseDto, DomainException>> {
    this.logger.log('Executing update vehicle use case', {
      vehicleId: id,
      updateData: {
        licensePlate: updateVehicleDto.licensePlate,
        make: updateVehicleDto.make,
        model: updateVehicleDto.model,
        year: updateVehicleDto.year,
      },
      context: 'UpdateVehicleUseCase.execute',
    })

    try {
      // Check if vehicle exists
      const existingVehicle = await this.vehicleRepository.findById(id)
      if (!existingVehicle) {
        const error = new VehicleNotFoundException(`Vehicle not found with id: ${id}`)
        this.logger.warn('Update vehicle use case failed - vehicle not found', {
          vehicleId: id,
          error: error.message,
          context: 'UpdateVehicleUseCase.execute',
        })
        return new Failure(error)
      }

      // Update the vehicle using mapper
      const vehicleToUpdate = VehicleMapper.fromUpdateDto(updateVehicleDto, existingVehicle)
      const updatedVehicle = await this.vehicleRepository.update(id, vehicleToUpdate)
      const result = VehicleMapper.toResponseDto(updatedVehicle)

      this.logger.log('Update vehicle use case completed successfully', {
        vehicleId: result.id,
        licensePlate: result.licensePlate,
        make: result.make,
        model: result.model,
        context: 'UpdateVehicleUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Update vehicle use case failed', {
        vehicleId: id,
        updateData: Object.keys(updateVehicleDto),
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'UpdateVehicleUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException('Failed to update vehicle', JSON.stringify(updateVehicleDto)),
      )
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { VehicleNotFoundException } from '@domain/vehicles/exceptions'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for deleting a vehicle
 * Handles the orchestration for vehicle deletion business process
 */
@Injectable()
export class DeleteVehicleUseCase {
  private readonly logger = new Logger(DeleteVehicleUseCase.name)

  /**
   * Constructor for DeleteVehicleUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute vehicle deletion
   * @param id - Vehicle ID to delete
   * @returns Result with success status or error
   */
  async execute(id: string): Promise<Result<boolean, DomainException>> {
    this.logger.log('Executing delete vehicle use case', {
      vehicleId: id,
      context: 'DeleteVehicleUseCase.execute',
    })

    try {
      // Check if vehicle exists
      const vehicle = await this.vehicleRepository.findById(id)
      if (!vehicle) {
        const error = new VehicleNotFoundException(`Vehicle not found with id: ${id}`)
        this.logger.warn('Delete vehicle use case failed - vehicle not found', {
          vehicleId: id,
          error: error.message,
          context: 'DeleteVehicleUseCase.execute',
        })
        return new Failure(error)
      }

      // Delete the vehicle
      await this.vehicleRepository.delete(id)

      this.logger.log('Delete vehicle use case completed successfully', {
        vehicleId: id,
        context: 'DeleteVehicleUseCase.execute',
      })

      return new Success(true)
    } catch (error) {
      this.logger.error('Delete vehicle use case failed', {
        vehicleId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'DeleteVehicleUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException('Failed to delete vehicle', id),
      )
    }
  }
}

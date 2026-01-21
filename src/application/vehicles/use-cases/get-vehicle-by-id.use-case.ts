import { Injectable, Logger, Inject } from '@nestjs/common'

import { VehicleResponseDto } from '@application/vehicles/dto'
import { VehicleMapper } from '@application/vehicles/mappers'
import { VehicleNotFoundException } from '@domain/vehicles/exceptions'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting a vehicle by ID
 * Handles the orchestration for vehicle retrieval by ID business process
 */
@Injectable()
export class GetVehicleByIdUseCase {
  private readonly logger = new Logger(GetVehicleByIdUseCase.name)

  /**
   * Constructor for GetVehicleByIdUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute get vehicle by ID
   * @param id - Vehicle ID
   * @returns Result with vehicle response DTO or error
   */
  async execute(id: string): Promise<Result<VehicleResponseDto, DomainException>> {
    this.logger.log('Executing get vehicle by ID use case', {
      vehicleId: id,
      context: 'GetVehicleByIdUseCase.execute',
    })

    try {
      const vehicle = await this.vehicleRepository.findById(id)

      if (!vehicle) {
        const error = new VehicleNotFoundException(`Vehicle not found with id: ${id}`)
        this.logger.warn('Get vehicle by ID use case failed', {
          vehicleId: id,
          error: error.message,
          errorType: error.constructor.name,
          context: 'GetVehicleByIdUseCase.execute',
        })
        return new Failure(error)
      }

      const result = VehicleMapper.toResponseDto(vehicle)

      this.logger.log('Get vehicle by ID use case completed successfully', {
        vehicleId: result.id,
        licensePlate: result.licensePlate,
        context: 'GetVehicleByIdUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Get vehicle by ID use case failed', {
        vehicleId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'GetVehicleByIdUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new VehicleNotFoundException(`Vehicle not found with id: ${id}`),
      )
    }
  }
}

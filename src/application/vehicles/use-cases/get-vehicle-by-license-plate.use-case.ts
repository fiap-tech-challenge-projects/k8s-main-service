import { Injectable, Logger, Inject } from '@nestjs/common'

import { VehicleResponseDto } from '@application/vehicles/dto'
import { VehicleMapper } from '@application/vehicles/mappers'
import { VehicleNotFoundException } from '@domain/vehicles/exceptions'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting a vehicle by license plate
 * Handles the orchestration for vehicle retrieval by license plate business process
 */
@Injectable()
export class GetVehicleByLicensePlateUseCase {
  private readonly logger = new Logger(GetVehicleByLicensePlateUseCase.name)

  /**
   * Constructor for GetVehicleByLicensePlateUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute get vehicle by license plate
   * @param licensePlate - Vehicle license plate
   * @returns Result with vehicle response DTO or error
   */
  async execute(licensePlate: string): Promise<Result<VehicleResponseDto, DomainException>> {
    this.logger.log('Executing get vehicle by license plate use case', {
      licensePlate,
      context: 'GetVehicleByLicensePlateUseCase.execute',
    })

    try {
      const vehicle = await this.vehicleRepository.findByLicensePlate(licensePlate)

      if (!vehicle) {
        const error = new VehicleNotFoundException(
          `Vehicle not found with license plate: ${licensePlate}`,
        )
        this.logger.warn('Get vehicle by license plate use case failed', {
          licensePlate,
          error: error.message,
          errorType: error.constructor.name,
          context: 'GetVehicleByLicensePlateUseCase.execute',
        })
        return new Failure(error)
      }

      const result = VehicleMapper.toResponseDto(vehicle)

      this.logger.log('Get vehicle by license plate use case completed successfully', {
        vehicleId: result.id,
        licensePlate: result.licensePlate,
        context: 'GetVehicleByLicensePlateUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Get vehicle by license plate use case failed', {
        licensePlate,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'GetVehicleByLicensePlateUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new VehicleNotFoundException(`Vehicle not found with license plate: ${licensePlate}`),
      )
    }
  }
}

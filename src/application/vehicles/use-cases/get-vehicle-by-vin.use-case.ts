import { Injectable, Logger, Inject } from '@nestjs/common'

import { VehicleResponseDto } from '@application/vehicles/dto'
import { VehicleMapper } from '@application/vehicles/mappers'
import { VehicleNotFoundException } from '@domain/vehicles/exceptions'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting a vehicle by VIN
 * Handles the orchestration for vehicle retrieval by VIN business process
 */
@Injectable()
export class GetVehicleByVinUseCase {
  private readonly logger = new Logger(GetVehicleByVinUseCase.name)

  /**
   * Constructor for GetVehicleByVinUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute get vehicle by VIN
   * @param vin - Vehicle VIN
   * @returns Result with vehicle response DTO or error
   */
  async execute(vin: string): Promise<Result<VehicleResponseDto, DomainException>> {
    this.logger.log('Executing get vehicle by VIN use case', {
      vin,
      context: 'GetVehicleByVinUseCase.execute',
    })

    try {
      const vehicle = await this.vehicleRepository.findByVin(vin)

      if (!vehicle) {
        const error = new VehicleNotFoundException(`Vehicle not found with VIN: ${vin}`)
        this.logger.warn('Get vehicle by VIN use case failed', {
          vin,
          error: error.message,
          context: 'GetVehicleByVinUseCase.execute',
        })
        return new Failure(error)
      }

      const result = VehicleMapper.toResponseDto(vehicle)

      this.logger.log('Get vehicle by VIN use case completed successfully', {
        vehicleId: result.id,
        vin: vin,
        context: 'GetVehicleByVinUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Get vehicle by VIN use case failed', {
        vin,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'GetVehicleByVinUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new VehicleNotFoundException(`Vehicle not found with VIN: ${vin}`),
      )
    }
  }
}

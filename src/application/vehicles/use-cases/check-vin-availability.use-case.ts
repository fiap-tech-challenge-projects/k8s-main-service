import { Injectable, Logger, Inject } from '@nestjs/common'

import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for checking VIN availability
 * Handles the orchestration for VIN availability checking business process
 */
@Injectable()
export class CheckVinAvailabilityUseCase {
  private readonly logger = new Logger(CheckVinAvailabilityUseCase.name)

  /**
   * Constructor for CheckVinAvailabilityUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute check VIN availability
   * @param vin - VIN to check
   * @returns Result with availability status or error
   */
  async execute(vin: string): Promise<Result<{ available: boolean }, DomainException>> {
    this.logger.log('Executing check VIN availability use case', {
      vin,
      context: 'CheckVinAvailabilityUseCase.execute',
    })

    try {
      // Check if VIN already exists (not available)
      const exists = await this.vehicleRepository.vinExists(vin)
      const available = !exists

      this.logger.log('Check VIN availability use case completed successfully', {
        vin,
        available,
        context: 'CheckVinAvailabilityUseCase.execute',
      })

      return new Success({ available })
    } catch (error) {
      this.logger.error('Check VIN availability use case failed', {
        vin,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'CheckVinAvailabilityUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException('Failed to check VIN availability', vin),
      )
    }
  }
}

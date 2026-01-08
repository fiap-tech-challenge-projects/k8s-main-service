import { Injectable, Logger, Inject } from '@nestjs/common'

import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for checking license plate availability
 * Handles the orchestration for license plate availability checking business process
 */
@Injectable()
export class CheckLicensePlateAvailabilityUseCase {
  private readonly logger = new Logger(CheckLicensePlateAvailabilityUseCase.name)

  /**
   * Constructor for CheckLicensePlateAvailabilityUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute check license plate availability
   * @param licensePlate - License plate to check
   * @returns Result with availability status or error
   */
  async execute(licensePlate: string): Promise<Result<{ available: boolean }, DomainException>> {
    this.logger.log('Executing check license plate availability use case', {
      licensePlate,
      context: 'CheckLicensePlateAvailabilityUseCase.execute',
    })

    try {
      // Check if license plate already exists (not available)
      const exists = await this.vehicleRepository.licensePlateExists(licensePlate)
      const available = !exists

      this.logger.log('Check license plate availability use case completed successfully', {
        licensePlate,
        available,
        context: 'CheckLicensePlateAvailabilityUseCase.execute',
      })

      return new Success({ available })
    } catch (error) {
      this.logger.error('Check license plate availability use case failed', {
        licensePlate,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'CheckLicensePlateAvailabilityUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException('Failed to check license plate availability', licensePlate),
      )
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { VehicleEvaluationResponseDto } from '@application/vehicle-evaluations/dto'
import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import {
  VehicleEvaluationRepositoryInterface,
  VEHICLE_EVALUATION_REPOSITORY,
} from '@domain/vehicle-evaluations/interfaces'
import { DomainException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting vehicle evaluations by vehicle ID
 * Handles the orchestration for vehicle evaluation retrieval by vehicle business process
 */
@Injectable()
export class GetVehicleEvaluationsByVehicleIdUseCase {
  private readonly logger = new Logger(GetVehicleEvaluationsByVehicleIdUseCase.name)

  /**
   * Constructor for GetVehicleEvaluationsByVehicleIdUseCase
   * @param vehicleEvaluationRepository - Repository for vehicle evaluation operations
   */
  constructor(
    @Inject(VEHICLE_EVALUATION_REPOSITORY)
    private readonly vehicleEvaluationRepository: VehicleEvaluationRepositoryInterface,
  ) {}

  /**
   * Execute get vehicle evaluations by vehicle ID
   * @param vehicleId - Vehicle ID to search for
   * @returns Result with vehicle evaluation response DTOs array or domain exception
   */
  async execute(
    vehicleId: string,
  ): Promise<Result<VehicleEvaluationResponseDto[], DomainException>> {
    this.logger.log('Executing get vehicle evaluations by vehicle ID use case', {
      vehicleId,
      context: 'GetVehicleEvaluationsByVehicleIdUseCase.execute',
    })

    try {
      const vehicleEvaluations = await this.vehicleEvaluationRepository.findByVehicleId(vehicleId)

      const result = vehicleEvaluations.map((evaluation) =>
        VehicleEvaluationMapper.toResponseDto(evaluation),
      )

      this.logger.log('Get vehicle evaluations by vehicle ID use case completed successfully', {
        vehicleId,
        evaluationsCount: result.length,
        context: 'GetVehicleEvaluationsByVehicleIdUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Get vehicle evaluations by vehicle ID use case failed', {
        vehicleId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'GetVehicleEvaluationsByVehicleIdUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new Error(`Failed to get vehicle evaluations for vehicle: ${vehicleId}`),
      )
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { VehicleEvaluationResponseDto } from '@application/vehicle-evaluations/dto'
import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import { VehicleEvaluationNotFoundException } from '@domain/vehicle-evaluations/exceptions'
import {
  VehicleEvaluationRepositoryInterface,
  VEHICLE_EVALUATION_REPOSITORY,
} from '@domain/vehicle-evaluations/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for updating vehicle evaluation details
 * Handles the orchestration for vehicle evaluation details update business process
 */
@Injectable()
export class UpdateVehicleEvaluationDetailsUseCase {
  private readonly logger = new Logger(UpdateVehicleEvaluationDetailsUseCase.name)

  /**
   * Constructor for UpdateVehicleEvaluationDetailsUseCase
   * @param vehicleEvaluationRepository - Vehicle evaluation repository for data access
   */
  constructor(
    @Inject(VEHICLE_EVALUATION_REPOSITORY)
    private readonly vehicleEvaluationRepository: VehicleEvaluationRepositoryInterface,
  ) {}

  /**
   * Execute update vehicle evaluation details
   * @param id - Vehicle evaluation ID
   * @param details - Details object to update
   * @returns Result with updated vehicle evaluation response DTO or domain exception
   */
  async execute(
    id: string,
    details: Record<string, unknown>,
  ): Promise<Result<VehicleEvaluationResponseDto, DomainException>> {
    this.logger.log('Executing update vehicle evaluation details use case', {
      id,
      detailsKeys: Object.keys(details),
      context: 'UpdateVehicleEvaluationDetailsUseCase.execute',
    })

    try {
      // Validate details input
      if (!details || Object.keys(details).length === 0) {
        throw new InvalidValueException('Details cannot be empty', JSON.stringify(details))
      }

      // Find the vehicle evaluation
      const vehicleEvaluation = await this.vehicleEvaluationRepository.findById(id)
      if (!vehicleEvaluation) {
        throw new VehicleEvaluationNotFoundException(`Vehicle evaluation not found with id: ${id}`)
      }

      // Update vehicle evaluation details
      const updatedVehicleEvaluation = await this.vehicleEvaluationRepository.update(id, details)

      const result = VehicleEvaluationMapper.toResponseDto(updatedVehicleEvaluation)

      this.logger.log('Update vehicle evaluation details use case completed successfully', {
        id,
        detailsKeys: Object.keys(details),
        context: 'UpdateVehicleEvaluationDetailsUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Update vehicle evaluation details use case failed', {
        id,
        detailsKeys: Object.keys(details),
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'UpdateVehicleEvaluationDetailsUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException(
              `vehicle evaluation details for ID: ${id}`,
              'Failed to update vehicle evaluation details',
            ),
      )
    }
  }
}

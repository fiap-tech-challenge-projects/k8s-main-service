import { Injectable, Logger, Inject } from '@nestjs/common'

import {
  UpdateVehicleEvaluationDto,
  VehicleEvaluationResponseDto,
} from '@application/vehicle-evaluations/dto'
import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import { VehicleEvaluationNotFoundException } from '@domain/vehicle-evaluations/exceptions'
import {
  VehicleEvaluationRepositoryInterface,
  VEHICLE_EVALUATION_REPOSITORY,
} from '@domain/vehicle-evaluations/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for updating a vehicle evaluation
 * Handles the orchestration for vehicle evaluation update business process
 */
@Injectable()
export class UpdateVehicleEvaluationUseCase {
  private readonly logger = new Logger(UpdateVehicleEvaluationUseCase.name)

  /**
   * Constructor for UpdateVehicleEvaluationUseCase
   * @param vehicleEvaluationRepository - Vehicle evaluation repository for data access
   */
  constructor(
    @Inject(VEHICLE_EVALUATION_REPOSITORY)
    private readonly vehicleEvaluationRepository: VehicleEvaluationRepositoryInterface,
  ) {}

  /**
   * Execute vehicle evaluation update
   * @param id - Vehicle evaluation ID to update
   * @param updateVehicleEvaluationDto - Vehicle evaluation update data
   * @returns Result with vehicle evaluation response DTO or domain exception
   */
  async execute(
    id: string,
    updateVehicleEvaluationDto: UpdateVehicleEvaluationDto,
  ): Promise<Result<VehicleEvaluationResponseDto, DomainException>> {
    this.logger.log('Executing update vehicle evaluation use case', {
      vehicleEvaluationId: id,
      updateData: Object.keys(updateVehicleEvaluationDto),
      context: 'UpdateVehicleEvaluationUseCase.execute',
    })

    try {
      // Validate input data
      if (!updateVehicleEvaluationDto || Object.keys(updateVehicleEvaluationDto).length === 0) {
        throw new InvalidValueException(
          'Update data cannot be empty',
          JSON.stringify(updateVehicleEvaluationDto),
        )
      }

      // Find the vehicle evaluation
      const vehicleEvaluation = await this.vehicleEvaluationRepository.findById(id)
      if (!vehicleEvaluation) {
        throw new VehicleEvaluationNotFoundException(`Vehicle evaluation not found with id: ${id}`)
      }

      // Update vehicle evaluation
      const updatedVehicleEvaluation = await this.vehicleEvaluationRepository.update(
        id,
        updateVehicleEvaluationDto,
      )

      const result = VehicleEvaluationMapper.toResponseDto(updatedVehicleEvaluation)

      this.logger.log('Update vehicle evaluation use case completed successfully', {
        vehicleEvaluationId: result.id,
        updateData: Object.keys(updateVehicleEvaluationDto),
        context: 'UpdateVehicleEvaluationUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Update vehicle evaluation use case failed', {
        vehicleEvaluationId: id,
        updateData: Object.keys(updateVehicleEvaluationDto),
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'UpdateVehicleEvaluationUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException(
              `vehicle evaluation update for ID: ${id}`,
              'Failed to update vehicle evaluation',
            ),
      )
    }
  }
}

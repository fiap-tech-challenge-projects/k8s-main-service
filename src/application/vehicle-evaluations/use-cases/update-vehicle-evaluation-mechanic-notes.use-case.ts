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
 * Use case for updating vehicle evaluation mechanic notes
 * Handles the orchestration for vehicle evaluation mechanic notes update business process
 */
@Injectable()
export class UpdateVehicleEvaluationMechanicNotesUseCase {
  private readonly logger = new Logger(UpdateVehicleEvaluationMechanicNotesUseCase.name)

  /**
   * Constructor for UpdateVehicleEvaluationMechanicNotesUseCase
   * @param vehicleEvaluationRepository - Repository for vehicle evaluation operations
   */
  constructor(
    @Inject(VEHICLE_EVALUATION_REPOSITORY)
    private readonly vehicleEvaluationRepository: VehicleEvaluationRepositoryInterface,
  ) {}

  /**
   * Execute update vehicle evaluation mechanic notes
   * @param id - Vehicle evaluation ID
   * @param notes - Mechanic notes to update
   * @returns Result with updated vehicle evaluation response DTO or domain exception
   */
  async execute(
    id: string,
    notes: string,
  ): Promise<Result<VehicleEvaluationResponseDto, DomainException>> {
    this.logger.log('Executing update vehicle evaluation mechanic notes use case', {
      id,
      notesLength: notes.length,
      context: 'UpdateVehicleEvaluationMechanicNotesUseCase.execute',
    })

    try {
      // Validate notes input
      if (!notes || notes.trim().length === 0) {
        throw new InvalidValueException('Mechanic notes cannot be empty', notes)
      }

      // Find the vehicle evaluation
      const vehicleEvaluation = await this.vehicleEvaluationRepository.findById(id)
      if (!vehicleEvaluation) {
        throw new VehicleEvaluationNotFoundException(`Vehicle evaluation not found with id: ${id}`)
      }

      // Update mechanic notes
      const updatedVehicleEvaluation = await this.vehicleEvaluationRepository.update(id, {
        mechanicNotes: notes.trim(),
      })

      const result = VehicleEvaluationMapper.toResponseDto(updatedVehicleEvaluation)

      this.logger.log('Update vehicle evaluation mechanic notes use case completed successfully', {
        id,
        notesLength: notes.length,
        context: 'UpdateVehicleEvaluationMechanicNotesUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Update vehicle evaluation mechanic notes use case failed', {
        id,
        notesLength: notes.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'UpdateVehicleEvaluationMechanicNotesUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException(
              `vehicle evaluation mechanic notes for ID: ${id}`,
              'Failed to update vehicle evaluation mechanic notes',
            ),
      )
    }
  }
}

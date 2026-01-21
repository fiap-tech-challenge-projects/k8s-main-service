import { Injectable, Logger, Inject } from '@nestjs/common'

import { VehicleEvaluationNotFoundException } from '@domain/vehicle-evaluations/exceptions'
import {
  VehicleEvaluationRepositoryInterface,
  VEHICLE_EVALUATION_REPOSITORY,
} from '@domain/vehicle-evaluations/interfaces'
import { DomainException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for deleting a vehicle evaluation
 * Handles the orchestration for vehicle evaluation deletion business process
 */
@Injectable()
export class DeleteVehicleEvaluationUseCase {
  private readonly logger = new Logger(DeleteVehicleEvaluationUseCase.name)

  /**
   * Constructor for DeleteVehicleEvaluationUseCase
   * @param vehicleEvaluationRepository - Vehicle evaluation repository for data access
   */
  constructor(
    @Inject(VEHICLE_EVALUATION_REPOSITORY)
    private readonly vehicleEvaluationRepository: VehicleEvaluationRepositoryInterface,
  ) {}

  /**
   * Execute delete vehicle evaluation
   * @param id - Vehicle evaluation ID to delete
   * @returns Result with boolean success or domain exception
   */
  async execute(id: string): Promise<Result<boolean, DomainException>> {
    this.logger.log('Executing delete vehicle evaluation use case', {
      vehicleEvaluationId: id,
      context: 'DeleteVehicleEvaluationUseCase.execute',
    })

    try {
      // Check if vehicle evaluation exists
      const existingVehicleEvaluation = await this.vehicleEvaluationRepository.findById(id)
      if (!existingVehicleEvaluation) {
        const error = new VehicleEvaluationNotFoundException(id)
        this.logger.warn('Vehicle evaluation not found for deletion', {
          vehicleEvaluationId: id,
          context: 'DeleteVehicleEvaluationUseCase.execute',
        })
        return new Failure(error)
      }

      // Delete the vehicle evaluation
      const deleted = await this.vehicleEvaluationRepository.delete(id)

      this.logger.log('Delete vehicle evaluation use case completed successfully', {
        vehicleEvaluationId: id,
        deleted,
        context: 'DeleteVehicleEvaluationUseCase.execute',
      })

      return new Success(deleted)
    } catch (error) {
      this.logger.error('Delete vehicle evaluation use case failed', {
        vehicleEvaluationId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'DeleteVehicleEvaluationUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException ? error : new VehicleEvaluationNotFoundException(id),
      )
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { VehicleEvaluationResponseDto } from '@application/vehicle-evaluations/dto'
import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import { VehicleEvaluationNotFoundException } from '@domain/vehicle-evaluations/exceptions'
import {
  VehicleEvaluationRepositoryInterface,
  VEHICLE_EVALUATION_REPOSITORY,
} from '@domain/vehicle-evaluations/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for getting a vehicle evaluation by ID
 * Handles the orchestration for vehicle evaluation retrieval by ID
 */
@Injectable()
export class GetVehicleEvaluationByIdUseCase {
  private readonly logger = new Logger(GetVehicleEvaluationByIdUseCase.name)

  /**
   * Constructor for GetVehicleEvaluationByIdUseCase
   * @param vehicleEvaluationRepository - Vehicle evaluation repository for data access
   */
  constructor(
    @Inject(VEHICLE_EVALUATION_REPOSITORY)
    private readonly vehicleEvaluationRepository: VehicleEvaluationRepositoryInterface,
  ) {}

  /**
   * Execute vehicle evaluation retrieval by ID
   * @param id - Vehicle evaluation ID
   * @returns Result with vehicle evaluation response DTO or exception
   */
  async execute(
    id: string,
  ): Promise<Result<VehicleEvaluationResponseDto, VehicleEvaluationNotFoundException>> {
    this.logger.log('Executing get vehicle evaluation by ID use case', {
      vehicleEvaluationId: id,
      context: 'GetVehicleEvaluationByIdUseCase.execute',
    })

    try {
      const vehicleEvaluation = await this.vehicleEvaluationRepository.findById(id)

      if (!vehicleEvaluation) {
        const error = new VehicleEvaluationNotFoundException(id)
        this.logger.warn('Vehicle evaluation not found', {
          vehicleEvaluationId: id,
          context: 'GetVehicleEvaluationByIdUseCase.execute',
        })
        return FAILURE(error)
      }

      const responseDto = VehicleEvaluationMapper.toResponseDto(vehicleEvaluation)

      this.logger.log('Get vehicle evaluation by ID use case completed successfully', {
        vehicleEvaluationId: responseDto.id,
        vehicleId: responseDto.vehicleId,
        serviceOrderId: responseDto.serviceOrderId,
        context: 'GetVehicleEvaluationByIdUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorType = error instanceof Error ? error.constructor.name : 'Error'

      this.logger.error('Get vehicle evaluation by ID use case failed', {
        vehicleEvaluationId: id,
        error: errorMessage,
        errorType,
        context: 'GetVehicleEvaluationByIdUseCase.execute',
      })

      if (error instanceof VehicleEvaluationNotFoundException) {
        return FAILURE(error)
      }

      return FAILURE(new VehicleEvaluationNotFoundException(id))
    }
  }
}

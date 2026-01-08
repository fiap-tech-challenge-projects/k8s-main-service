import { Injectable, Logger, Inject } from '@nestjs/common'

import { VehicleEvaluationResponseDto } from '@application/vehicle-evaluations/dto'
import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import { VehicleEvaluationNotFoundException } from '@domain/vehicle-evaluations/exceptions'
import {
  VehicleEvaluationRepositoryInterface,
  VEHICLE_EVALUATION_REPOSITORY,
} from '@domain/vehicle-evaluations/interfaces'
import { DomainException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting vehicle evaluation by service order ID
 * Handles the orchestration for vehicle evaluation retrieval by service order business process
 */
@Injectable()
export class GetVehicleEvaluationByServiceOrderIdUseCase {
  private readonly logger = new Logger(GetVehicleEvaluationByServiceOrderIdUseCase.name)

  /**
   * Constructor for GetVehicleEvaluationByServiceOrderIdUseCase
   * @param vehicleEvaluationRepository - Repository for vehicle evaluation operations
   */
  constructor(
    @Inject(VEHICLE_EVALUATION_REPOSITORY)
    private readonly vehicleEvaluationRepository: VehicleEvaluationRepositoryInterface,
  ) {}

  /**
   * Execute get vehicle evaluation by service order ID
   * @param serviceOrderId - Service order ID to search for
   * @returns Result with vehicle evaluation response DTO or domain exception
   */
  async execute(
    serviceOrderId: string,
  ): Promise<Result<VehicleEvaluationResponseDto, DomainException>> {
    this.logger.log('Executing get vehicle evaluation by service order ID use case', {
      serviceOrderId,
      context: 'GetVehicleEvaluationByServiceOrderIdUseCase.execute',
    })

    try {
      const vehicleEvaluation =
        await this.vehicleEvaluationRepository.findByServiceOrderId(serviceOrderId)

      if (!vehicleEvaluation) {
        return new Failure(
          new VehicleEvaluationNotFoundException(
            `Vehicle evaluation not found for service order: ${serviceOrderId}`,
          ),
        )
      }

      const result = VehicleEvaluationMapper.toResponseDto(vehicleEvaluation)

      this.logger.log(
        'Get vehicle evaluation by service order ID use case completed successfully',
        {
          serviceOrderId,
          vehicleEvaluationId: result.id,
          context: 'GetVehicleEvaluationByServiceOrderIdUseCase.execute',
        },
      )

      return new Success(result)
    } catch (error) {
      this.logger.error('Get vehicle evaluation by service order ID use case failed', {
        serviceOrderId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'GetVehicleEvaluationByServiceOrderIdUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new VehicleEvaluationNotFoundException(
              `Vehicle evaluation not found for service order: ${serviceOrderId}`,
            ),
      )
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import {
  CreateVehicleEvaluationDto,
  VehicleEvaluationResponseDto,
} from '@application/vehicle-evaluations/dto'
import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import {
  VehicleEvaluationRepositoryInterface,
  VEHICLE_EVALUATION_REPOSITORY,
} from '@domain/vehicle-evaluations/interfaces'
import { DomainException } from '@shared/exceptions'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for creating a new vehicle evaluation
 * Handles the orchestration for vehicle evaluation creation business process
 */
@Injectable()
export class CreateVehicleEvaluationUseCase {
  private readonly logger = new Logger(CreateVehicleEvaluationUseCase.name)

  /**
   * Constructor for CreateVehicleEvaluationUseCase
   * @param vehicleEvaluationRepository - Vehicle evaluation repository for data access
   */
  constructor(
    @Inject(VEHICLE_EVALUATION_REPOSITORY)
    private readonly vehicleEvaluationRepository: VehicleEvaluationRepositoryInterface,
  ) {}

  /**
   * Execute vehicle evaluation creation
   * @param createVehicleEvaluationDto - Vehicle evaluation creation data
   * @returns Result with vehicle evaluation response DTO or domain exception
   */
  async execute(
    createVehicleEvaluationDto: CreateVehicleEvaluationDto,
  ): Promise<Result<VehicleEvaluationResponseDto, DomainException>> {
    this.logger.log('Executing create vehicle evaluation use case', {
      vehicleId: createVehicleEvaluationDto.vehicleId,
      serviceOrderId: createVehicleEvaluationDto.serviceOrderId,
      context: 'CreateVehicleEvaluationUseCase.execute',
    })

    try {
      const vehicleEvaluation = VehicleEvaluationMapper.fromCreateDto(createVehicleEvaluationDto)
      const savedVehicleEvaluation =
        await this.vehicleEvaluationRepository.create(vehicleEvaluation)

      const responseDto = VehicleEvaluationMapper.toResponseDto(savedVehicleEvaluation)

      this.logger.log('Vehicle evaluation creation use case completed successfully', {
        evaluationId: responseDto.id,
        vehicleId: responseDto.vehicleId,
        serviceOrderId: responseDto.serviceOrderId,
        context: 'CreateVehicleEvaluationUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorType = error instanceof Error ? error.constructor.name : 'Error'

      this.logger.error('Vehicle evaluation creation use case failed', {
        vehicleId: createVehicleEvaluationDto.vehicleId,
        serviceOrderId: createVehicleEvaluationDto.serviceOrderId,
        error: errorMessage,
        errorType,
        context: 'CreateVehicleEvaluationUseCase.execute',
      })

      if (error instanceof DomainException) {
        return FAILURE(error)
      }

      return FAILURE(
        new (class extends DomainException {
          constructor(message: string) {
            super(message)
          }
        })('Failed to create vehicle evaluation'),
      )
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedVehicleEvaluationsResponseDto } from '@application/vehicle-evaluations/dto'
import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import {
  VehicleEvaluationRepositoryInterface,
  VEHICLE_EVALUATION_REPOSITORY,
} from '@domain/vehicle-evaluations/interfaces'
import { DomainException } from '@shared/exceptions'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for getting all vehicle evaluations
 * Handles the orchestration for vehicle evaluation listing with optional pagination
 */
@Injectable()
export class GetAllVehicleEvaluationsUseCase {
  private readonly logger = new Logger(GetAllVehicleEvaluationsUseCase.name)

  /**
   * Constructor for GetAllVehicleEvaluationsUseCase
   * @param vehicleEvaluationRepository - Vehicle evaluation repository for data access
   */
  constructor(
    @Inject(VEHICLE_EVALUATION_REPOSITORY)
    private readonly vehicleEvaluationRepository: VehicleEvaluationRepositoryInterface,
  ) {}

  /**
   * Execute vehicle evaluations retrieval
   * @param page - Page number for pagination (optional)
   * @param limit - Limit per page for pagination (optional)
   * @returns Result with paginated vehicle evaluations response DTO or domain exception
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedVehicleEvaluationsResponseDto, DomainException>> {
    this.logger.log('Executing get all vehicle evaluations use case', {
      page,
      limit,
      context: 'GetAllVehicleEvaluationsUseCase.execute',
    })

    try {
      const paginatedResult = await this.vehicleEvaluationRepository.findAll(page ?? 1, limit ?? 10)

      const responseDto: PaginatedVehicleEvaluationsResponseDto = {
        data: VehicleEvaluationMapper.toResponseDtoArray(paginatedResult.data),
        meta: paginatedResult.meta,
      }

      this.logger.log('Get all vehicle evaluations use case completed successfully', {
        count: responseDto.data.length,
        page: paginatedResult.meta.page,
        limit: paginatedResult.meta.limit,
        context: 'GetAllVehicleEvaluationsUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorType = error instanceof Error ? error.constructor.name : 'Error'

      this.logger.error('Get all vehicle evaluations use case failed', {
        page,
        limit,
        error: errorMessage,
        errorType,
        context: 'GetAllVehicleEvaluationsUseCase.execute',
      })

      if (error instanceof DomainException) {
        return FAILURE(error)
      }

      return FAILURE(
        new (class extends DomainException {
          constructor(message: string) {
            super(message)
          }
        })('Failed to retrieve vehicle evaluations'),
      )
    }
  }
}

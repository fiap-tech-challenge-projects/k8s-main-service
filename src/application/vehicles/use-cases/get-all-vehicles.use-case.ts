import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedVehiclesResponseDto } from '@application/vehicles/dto'
import { VehicleMapper } from '@application/vehicles/mappers'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting all vehicles with pagination
 * Handles the orchestration for vehicle listing business process
 */
@Injectable()
export class GetAllVehiclesUseCase {
  private readonly logger = new Logger(GetAllVehiclesUseCase.name)

  /**
   * Constructor for GetAllVehiclesUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute get all vehicles
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @returns Result with paginated vehicles response DTO or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedVehiclesResponseDto, DomainException>> {
    this.logger.log('Executing get all vehicles use case', {
      page,
      limit,
      context: 'GetAllVehiclesUseCase.execute',
    })

    try {
      const result = await this.vehicleRepository.findAll(page, limit)

      const mappedResult = {
        data: result.data.map((vehicle) => VehicleMapper.toResponseDto(vehicle)),
        meta: result.meta,
      }

      this.logger.log('Get all vehicles use case completed successfully', {
        totalItems: mappedResult.meta.total,
        pageSize: mappedResult.data.length,
        currentPage: mappedResult.meta.page,
        context: 'GetAllVehiclesUseCase.execute',
      })

      return new Success(mappedResult)
    } catch (error) {
      this.logger.error('Get all vehicles use case failed', {
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'GetAllVehiclesUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException(
              'Failed to get all vehicles',
              `page: ${page}, limit: ${limit}`,
            ),
      )
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedVehiclesResponseDto } from '@application/vehicles/dto'
import { VehicleMapper } from '@application/vehicles/mappers'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for searching vehicles by make and model
 * Handles the orchestration for vehicle search business process
 */
@Injectable()
export class SearchVehiclesByMakeModelUseCase {
  private readonly logger = new Logger(SearchVehiclesByMakeModelUseCase.name)

  /**
   * Constructor for SearchVehiclesByMakeModelUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute search vehicles by make and model
   * @param make - Vehicle make
   * @param model - Vehicle model
   * @param year - Vehicle year (optional)
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @returns Result with paginated vehicles response DTO or error
   */
  async execute(
    make: string,
    model: string,
    year?: number,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedVehiclesResponseDto, Error>> {
    this.logger.log('Executing search vehicles by make and model use case', {
      make,
      model,
      year,
      page,
      limit,
      context: 'SearchVehiclesByMakeModelUseCase.execute',
    })

    try {
      const result = await this.vehicleRepository.findByMakeAndModel(make, model, page, limit)

      const mappedResult = {
        data: result.data.map((vehicle) => VehicleMapper.toResponseDto(vehicle)),
        meta: result.meta,
      }

      this.logger.log('Search vehicles by make and model use case completed successfully', {
        make,
        model,
        year,
        totalItems: mappedResult.meta.total,
        pageSize: mappedResult.data.length,
        currentPage: mappedResult.meta.page,
        context: 'SearchVehiclesByMakeModelUseCase.execute',
      })

      return new Success(mappedResult)
    } catch (error) {
      this.logger.error('Search vehicles by make and model use case failed', {
        make,
        model,
        year,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'SearchVehiclesByMakeModelUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException(
              'Failed to search vehicles by make and model',
              `make: ${make}, model: ${model}, year: ${year}, page: ${page}, limit: ${limit}`,
            ),
      )
    }
  }
}

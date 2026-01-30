import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedVehiclesResponseDto } from '@application/vehicles/dto'
import { VehicleMapper } from '@application/vehicles/mappers'
import { IVehicleRepository, VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { DomainException, InvalidValueException } from '@shared/exceptions'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting vehicles by client ID
 * Handles the orchestration for vehicle retrieval by client business process
 */
@Injectable()
export class GetVehiclesByClientUseCase {
  private readonly logger = new Logger(GetVehiclesByClientUseCase.name)

  /**
   * Constructor for GetVehiclesByClientUseCase
   * @param vehicleRepository - Vehicle repository for data access
   */
  constructor(@Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehicleRepository) {}

  /**
   * Execute get vehicles by client
   * @param clientId - Client ID
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @returns Result with paginated vehicles response DTO or error
   */
  async execute(
    clientId: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedVehiclesResponseDto, DomainException>> {
    this.logger.log('Executing get vehicles by client use case', {
      clientId,
      page,
      limit,
      context: 'GetVehiclesByClientUseCase.execute',
    })

    try {
      const result = await this.vehicleRepository.findByClientId(clientId, page, limit)

      const mappedResult = {
        data: result.data.map((vehicle) => VehicleMapper.toResponseDto(vehicle)),
        meta: result.meta,
      }

      this.logger.log('Get vehicles by client use case completed successfully', {
        clientId,
        totalItems: mappedResult.meta.total,
        pageSize: mappedResult.data.length,
        currentPage: mappedResult.meta.page,
        context: 'GetVehiclesByClientUseCase.execute',
      })

      return new Success(mappedResult)
    } catch (error) {
      this.logger.error('Get vehicles by client use case failed', {
        clientId,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        context: 'GetVehiclesByClientUseCase.execute',
      })

      return new Failure(
        error instanceof DomainException
          ? error
          : new InvalidValueException(
              'Failed to get vehicles by client',
              `clientId: ${clientId}, page: ${page}, limit: ${limit}`,
            ),
      )
    }
  }
}

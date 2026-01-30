import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedServiceExecutionsResponseDto } from '@application/service-executions/dto'
import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import {
  SERVICE_EXECUTION_REPOSITORY,
  ServiceExecutionRepositoryInterface,
} from '@domain/service-executions/interfaces'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting service executions by service order
 * Handles the business logic for service execution retrieval by service order
 */
@Injectable()
export class GetServiceExecutionsByServiceOrderUseCase {
  private readonly logger = new Logger(GetServiceExecutionsByServiceOrderUseCase.name)

  /**
   * Constructor for GetServiceExecutionsByServiceOrderUseCase
   * @param serviceExecutionRepository - Service execution repository for data access
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
  ) {}

  /**
   * Execute the get service executions by service order use case
   * @param serviceOrderId - Service order ID
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Result with paginated service execution response or error
   */
  async execute(
    serviceOrderId: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedServiceExecutionsResponseDto, Error>> {
    try {
      this.logger.log('Executing get service executions by service order use case', {
        serviceOrderId,
        page,
        limit,
        context: 'GetServiceExecutionsByServiceOrderUseCase.execute',
      })

      const paginatedResult = await this.serviceExecutionRepository.findByServiceOrderIdPaginated(
        serviceOrderId,
        page,
        limit,
      )
      const responseDto: PaginatedServiceExecutionsResponseDto = {
        data: paginatedResult.data.map(ServiceExecutionMapper.toResponseDto),
        meta: {
          page: paginatedResult.meta.page,
          limit: paginatedResult.meta.limit,
          total: paginatedResult.meta.total,
          totalPages: paginatedResult.meta.totalPages,
          hasNext: paginatedResult.meta.hasNext,
          hasPrev: paginatedResult.meta.hasPrev,
        },
      }

      this.logger.log('Get service executions by service order use case completed successfully', {
        serviceOrderId,
        page,
        limit,
        totalItems: responseDto.data.length,
        context: 'GetServiceExecutionsByServiceOrderUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error in get service executions by service order use case', {
        serviceOrderId,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetServiceExecutionsByServiceOrderUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

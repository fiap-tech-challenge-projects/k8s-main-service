import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedServiceExecutionsResponseDto } from '@application/service-executions/dto'
import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import {
  ServiceExecutionRepositoryInterface,
  SERVICE_EXECUTION_REPOSITORY,
} from '@domain/service-executions/interfaces'
import { Result, SUCCESS } from '@shared/types'

/**
 * Use case for getting all service executions with pagination
 * Handles the orchestration for service execution list retrieval business process
 */
@Injectable()
export class GetAllServiceExecutionsUseCase {
  private readonly logger = new Logger(GetAllServiceExecutionsUseCase.name)

  /**
   * Constructor for GetAllServiceExecutionsUseCase
   * @param serviceExecutionRepository - Service execution repository for data access
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
  ) {}

  /**
   * Execute service execution list retrieval with pagination
   * @param page - Page number
   * @param limit - Items per page
   * @returns Result with paginated service execution response DTO or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedServiceExecutionsResponseDto, Error>> {
    this.logger.log('Executing get all service executions use case', {
      page,
      limit,
      context: 'GetAllServiceExecutionsUseCase.execute',
    })

    try {
      const paginatedResult = await this.serviceExecutionRepository.findAll(page, limit)

      const serviceExecutions = paginatedResult.data.map((serviceExecution) =>
        ServiceExecutionMapper.toResponseDto(serviceExecution),
      )

      const responseDto: PaginatedServiceExecutionsResponseDto = {
        data: serviceExecutions,
        meta: paginatedResult.meta,
      }

      this.logger.log('Get all service executions use case completed successfully', {
        totalItems: responseDto.data.length,
        page: responseDto.meta.page,
        totalPages: responseDto.meta.totalPages,
        context: 'GetAllServiceExecutionsUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Unexpected error in get all service executions use case', {
        page,
        limit,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: 'GetAllServiceExecutionsUseCase.execute',
      })
      throw error
    }
  }
}

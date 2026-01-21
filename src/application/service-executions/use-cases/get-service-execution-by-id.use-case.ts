import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceExecutionResponseDto } from '@application/service-executions/dto'
import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { ServiceExecutionNotFoundException } from '@domain/service-executions/exceptions'
import {
  ServiceExecutionRepositoryInterface,
  SERVICE_EXECUTION_REPOSITORY,
} from '@domain/service-executions/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for getting a service execution by ID
 * Handles the orchestration for service execution retrieval by ID
 */
@Injectable()
export class GetServiceExecutionByIdUseCase {
  private readonly logger = new Logger(GetServiceExecutionByIdUseCase.name)

  /**
   * Constructor for GetServiceExecutionByIdUseCase
   * @param serviceExecutionRepository - Service execution repository for data access
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
  ) {}

  /**
   * Execute service execution retrieval by ID
   * @param id - Service execution ID
   * @returns Result with service execution response DTO or domain exception
   */
  async execute(
    id: string,
  ): Promise<Result<ServiceExecutionResponseDto, ServiceExecutionNotFoundException>> {
    this.logger.log('Executing get service execution by ID use case', {
      serviceExecutionId: id,
      context: 'GetServiceExecutionByIdUseCase.execute',
    })

    try {
      const serviceExecution = await this.serviceExecutionRepository.findById(id)

      if (!serviceExecution) {
        const error = new ServiceExecutionNotFoundException(
          `Service execution with ID ${id} not found`,
        )
        this.logger.warn('Get service execution by ID use case failed - not found', {
          serviceExecutionId: id,
          error: error.message,
          errorType: error.constructor.name,
          context: 'GetServiceExecutionByIdUseCase.execute',
        })
        return FAILURE(error)
      }

      const responseDto = ServiceExecutionMapper.toResponseDto(serviceExecution)

      this.logger.log('Get service execution by ID use case completed successfully', {
        serviceExecutionId: responseDto.id,
        status: responseDto.status,
        context: 'GetServiceExecutionByIdUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Unexpected error in get service execution by ID use case', {
        serviceExecutionId: id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: 'GetServiceExecutionByIdUseCase.execute',
      })
      throw error
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceExecutionResponseDto } from '@application/service-executions/dto'
import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { ServiceExecutionNotFoundException } from '@domain/service-executions/exceptions'
import {
  SERVICE_EXECUTION_REPOSITORY,
  ServiceExecutionRepositoryInterface,
} from '@domain/service-executions/interfaces'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for completing a service execution
 * Handles the business logic for service execution completion
 */
@Injectable()
export class CompleteServiceExecutionUseCase {
  private readonly logger = new Logger(CompleteServiceExecutionUseCase.name)

  /**
   * Constructor for CompleteServiceExecutionUseCase
   * @param serviceExecutionRepository - Service execution repository for data access
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
  ) {}

  /**
   * Execute the complete service execution use case
   * @param serviceExecutionId - Service execution ID to complete
   * @param notes - Optional completion notes
   * @returns Result with completed service execution response or error
   */
  async execute(
    serviceExecutionId: string,
    notes?: string,
  ): Promise<Result<ServiceExecutionResponseDto, Error>> {
    try {
      this.logger.log('Executing complete service execution use case', {
        serviceExecutionId,
        notes,
        context: 'CompleteServiceExecutionUseCase.execute',
      })

      const serviceExecution = await this.serviceExecutionRepository.findById(serviceExecutionId)
      if (!serviceExecution) {
        const error = new ServiceExecutionNotFoundException(serviceExecutionId)
        this.logger.warn('Service execution not found for completion', {
          serviceExecutionId,
          error: error.message,
          context: 'CompleteServiceExecutionUseCase.execute',
        })
        return new Failure(error)
      }

      serviceExecution.updateCompletedExecution(notes)
      const updatedServiceExecution = await this.serviceExecutionRepository.update(
        serviceExecutionId,
        serviceExecution,
      )
      const responseDto = ServiceExecutionMapper.toResponseDto(updatedServiceExecution)

      this.logger.log('Complete service execution use case completed successfully', {
        serviceExecutionId,
        notes,
        completedServiceExecution: responseDto,
        context: 'CompleteServiceExecutionUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error in complete service execution use case', {
        serviceExecutionId,
        notes,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'CompleteServiceExecutionUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

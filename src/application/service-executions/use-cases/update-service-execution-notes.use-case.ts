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
 * Use case for updating service execution notes
 * Handles the business logic for notes updates
 */
@Injectable()
export class UpdateServiceExecutionNotesUseCase {
  private readonly logger = new Logger(UpdateServiceExecutionNotesUseCase.name)

  /**
   * Constructor for UpdateServiceExecutionNotesUseCase
   * @param serviceExecutionRepository - Service execution repository for data access
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
  ) {}

  /**
   * Execute the update service execution notes use case
   * @param serviceExecutionId - Service execution ID
   * @param notes - New notes to set
   * @returns Result with updated service execution response or error
   */
  async execute(
    serviceExecutionId: string,
    notes: string,
  ): Promise<Result<ServiceExecutionResponseDto, Error>> {
    try {
      this.logger.log('Executing update service execution notes use case', {
        serviceExecutionId,
        notes,
        context: 'UpdateServiceExecutionNotesUseCase.execute',
      })

      const serviceExecution = await this.serviceExecutionRepository.findById(serviceExecutionId)
      if (!serviceExecution) {
        const error = new ServiceExecutionNotFoundException(serviceExecutionId)
        this.logger.warn('Service execution not found for notes update', {
          serviceExecutionId,
          error: error.message,
          context: 'UpdateServiceExecutionNotesUseCase.execute',
        })
        return new Failure(error)
      }

      serviceExecution.updateNotes(notes)
      const updatedServiceExecution = await this.serviceExecutionRepository.update(
        serviceExecutionId,
        serviceExecution,
      )
      const responseDto = ServiceExecutionMapper.toResponseDto(updatedServiceExecution)

      this.logger.log('Update service execution notes use case completed successfully', {
        serviceExecutionId,
        notes,
        updatedServiceExecution: responseDto,
        context: 'UpdateServiceExecutionNotesUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error in update service execution notes use case', {
        serviceExecutionId,
        notes,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'UpdateServiceExecutionNotesUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceExecutionNotFoundException } from '@domain/service-executions/exceptions'
import {
  SERVICE_EXECUTION_REPOSITORY,
  ServiceExecutionRepositoryInterface,
} from '@domain/service-executions/interfaces'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for deleting a service execution
 * Handles the business logic for service execution deletion
 */
@Injectable()
export class DeleteServiceExecutionUseCase {
  private readonly logger = new Logger(DeleteServiceExecutionUseCase.name)

  /**
   * Constructor for DeleteServiceExecutionUseCase
   * @param serviceExecutionRepository - Service execution repository for data access
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
  ) {}

  /**
   * Execute the delete service execution use case
   * @param serviceExecutionId - Service execution ID to delete
   * @returns Result with success or error
   */
  async execute(serviceExecutionId: string): Promise<Result<void, Error>> {
    try {
      this.logger.log('Executing delete service execution use case', {
        serviceExecutionId,
        context: 'DeleteServiceExecutionUseCase.execute',
      })

      const serviceExecution = await this.serviceExecutionRepository.findById(serviceExecutionId)
      if (!serviceExecution) {
        const error = new ServiceExecutionNotFoundException(serviceExecutionId)
        this.logger.warn('Service execution not found for deletion', {
          serviceExecutionId,
          error: error.message,
          context: 'DeleteServiceExecutionUseCase.execute',
        })
        return new Failure(error)
      }

      await this.serviceExecutionRepository.delete(serviceExecutionId)

      this.logger.log('Delete service execution use case completed successfully', {
        serviceExecutionId,
        context: 'DeleteServiceExecutionUseCase.execute',
      })

      return new Success(undefined)
    } catch (error) {
      this.logger.error('Error in delete service execution use case', {
        serviceExecutionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'DeleteServiceExecutionUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

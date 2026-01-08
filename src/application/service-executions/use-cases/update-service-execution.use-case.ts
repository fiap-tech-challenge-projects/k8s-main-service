import { Injectable, Logger, Inject } from '@nestjs/common'

import {
  UpdateServiceExecutionDto,
  ServiceExecutionResponseDto,
} from '@application/service-executions/dto'
import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { ServiceExecutionNotFoundException } from '@domain/service-executions/exceptions'
import {
  SERVICE_EXECUTION_REPOSITORY,
  ServiceExecutionRepositoryInterface,
} from '@domain/service-executions/interfaces'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for updating an existing service execution
 * Handles the business logic for service execution updates
 */
@Injectable()
export class UpdateServiceExecutionUseCase {
  private readonly logger = new Logger(UpdateServiceExecutionUseCase.name)

  /**
   * Constructor for UpdateServiceExecutionUseCase
   * @param serviceExecutionRepository - Service execution repository for data access
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
  ) {}

  /**
   * Execute the update service execution use case
   * @param id - Service execution ID to update
   * @param dto - Update service execution data
   * @returns Result with updated service execution response or error
   */
  async execute(
    id: string,
    dto: UpdateServiceExecutionDto,
  ): Promise<Result<ServiceExecutionResponseDto, Error>> {
    try {
      this.logger.log('Executing update service execution use case', {
        serviceExecutionId: id,
        updateData: dto,
        context: 'UpdateServiceExecutionUseCase.execute',
      })

      const existingServiceExecution = await this.serviceExecutionRepository.findById(id)
      if (!existingServiceExecution) {
        const error = new ServiceExecutionNotFoundException(id)
        this.logger.warn('Service execution not found for update', {
          serviceExecutionId: id,
          error: error.message,
          context: 'UpdateServiceExecutionUseCase.execute',
        })
        return new Failure(error)
      }

      const updatedServiceExecution = ServiceExecutionMapper.fromUpdateDto(
        existingServiceExecution,
        dto,
      )
      const savedServiceExecution = await this.serviceExecutionRepository.update(
        id,
        updatedServiceExecution,
      )
      const responseDto = ServiceExecutionMapper.toResponseDto(savedServiceExecution)

      this.logger.log('Update service execution use case completed successfully', {
        serviceExecutionId: id,
        updatedServiceExecution: responseDto,
        context: 'UpdateServiceExecutionUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error in update service execution use case', {
        serviceExecutionId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'UpdateServiceExecutionUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

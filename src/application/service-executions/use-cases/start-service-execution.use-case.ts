import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceExecutionResponseDto } from '@application/service-executions/dto'
import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { ServiceExecutionNotFoundException } from '@domain/service-executions/exceptions'
import {
  ServiceExecutionRepositoryInterface,
  SERVICE_EXECUTION_REPOSITORY,
} from '@domain/service-executions/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for starting a service execution
 * Handles the orchestration for service execution start business process
 */
@Injectable()
export class StartServiceExecutionUseCase {
  private readonly logger = new Logger(StartServiceExecutionUseCase.name)

  /**
   * Constructor for StartServiceExecutionUseCase
   * @param serviceExecutionRepository - Repository for service execution operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute service execution start
   * @param id - Service execution ID
   * @returns Result with service execution response DTO or error
   */
  async execute(
    id: string,
  ): Promise<Result<ServiceExecutionResponseDto, ServiceExecutionNotFoundException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing start service execution use case', {
        serviceExecutionId: id,
        requestedBy: currentUserId,
        context: 'StartServiceExecutionUseCase.execute',
      })

      // Check if service execution exists
      const serviceExecution = await this.serviceExecutionRepository.findById(id)
      if (!serviceExecution) {
        const error = new ServiceExecutionNotFoundException(id)
        this.logger.warn('Service execution not found', {
          serviceExecutionId: id,
          requestedBy: currentUserId,
          context: 'StartServiceExecutionUseCase.execute',
        })
        return new Failure(error)
      }

      // Start execution
      serviceExecution.updateStartedExecution()
      const updatedExecution = await this.serviceExecutionRepository.update(id, serviceExecution)
      const responseDto = ServiceExecutionMapper.toResponseDto(updatedExecution)

      this.logger.log('Start service execution use case completed successfully', {
        serviceExecutionId: id,
        status: responseDto.status,
        requestedBy: currentUserId,
        context: 'StartServiceExecutionUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error starting service execution', {
        serviceExecutionId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'StartServiceExecutionUseCase.execute',
      })
      return new Failure(new ServiceExecutionNotFoundException(id))
    }
  }
}

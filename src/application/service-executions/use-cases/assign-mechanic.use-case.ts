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
 * Use case for assigning a mechanic to a service execution
 * Handles the business logic for mechanic assignment
 */
@Injectable()
export class AssignMechanicUseCase {
  private readonly logger = new Logger(AssignMechanicUseCase.name)

  /**
   * Constructor for AssignMechanicUseCase
   * @param serviceExecutionRepository - Service execution repository for data access
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
  ) {}

  /**
   * Execute the assign mechanic use case
   * @param serviceExecutionId - Service execution ID
   * @param mechanicId - Mechanic ID to assign
   * @returns Result with updated service execution response or error
   */
  async execute(
    serviceExecutionId: string,
    mechanicId: string,
  ): Promise<Result<ServiceExecutionResponseDto, Error>> {
    try {
      this.logger.log('Executing assign mechanic use case', {
        serviceExecutionId,
        mechanicId,
        context: 'AssignMechanicUseCase.execute',
      })

      const serviceExecution = await this.serviceExecutionRepository.findById(serviceExecutionId)
      if (!serviceExecution) {
        const error = new ServiceExecutionNotFoundException(serviceExecutionId)
        this.logger.warn('Service execution not found for mechanic assignment', {
          serviceExecutionId,
          error: error.message,
          context: 'AssignMechanicUseCase.execute',
        })
        return new Failure(error)
      }

      serviceExecution.updateAssignedMechanic(mechanicId)
      const updatedServiceExecution = await this.serviceExecutionRepository.update(
        serviceExecutionId,
        serviceExecution,
      )
      const responseDto = ServiceExecutionMapper.toResponseDto(updatedServiceExecution)

      this.logger.log('Assign mechanic use case completed successfully', {
        serviceExecutionId,
        mechanicId,
        updatedServiceExecution: responseDto,
        context: 'AssignMechanicUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error in assign mechanic use case', {
        serviceExecutionId,
        mechanicId,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'AssignMechanicUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

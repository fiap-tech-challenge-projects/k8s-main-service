import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceExecutionResponseDto } from '@application/service-executions/dto'
import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import {
  SERVICE_EXECUTION_REPOSITORY,
  ServiceExecutionRepositoryInterface,
} from '@domain/service-executions/interfaces'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting service executions by mechanic
 * Handles the business logic for service execution retrieval by mechanic
 */
@Injectable()
export class GetServiceExecutionsByMechanicUseCase {
  private readonly logger = new Logger(GetServiceExecutionsByMechanicUseCase.name)

  /**
   * Constructor for GetServiceExecutionsByMechanicUseCase
   * @param serviceExecutionRepository - Service execution repository for data access
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
  ) {}

  /**
   * Execute the get service executions by mechanic use case
   * @param mechanicId - Mechanic ID
   * @returns Result with service execution response array or error
   */
  async execute(mechanicId: string): Promise<Result<ServiceExecutionResponseDto[], Error>> {
    try {
      this.logger.log('Executing get service executions by mechanic use case', {
        mechanicId,
        context: 'GetServiceExecutionsByMechanicUseCase.execute',
      })

      const serviceExecutions = await this.serviceExecutionRepository.findByMechanicId(mechanicId)
      const responseDto = serviceExecutions.map(ServiceExecutionMapper.toResponseDto)

      this.logger.log('Get service executions by mechanic use case completed successfully', {
        mechanicId,
        totalItems: responseDto.length,
        context: 'GetServiceExecutionsByMechanicUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error in get service executions by mechanic use case', {
        mechanicId,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetServiceExecutionsByMechanicUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

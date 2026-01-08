import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceResponseDto } from '@application/services/dto'
import { ServiceMapper } from '@application/services/mappers'
import { ServiceNotFoundException } from '@domain/services/exceptions'
import { IServiceRepository, SERVICE_REPOSITORY } from '@domain/services/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting a service by ID
 * Handles the orchestration for service retrieval business process
 */
@Injectable()
export class GetServiceByIdUseCase {
  private readonly logger = new Logger(GetServiceByIdUseCase.name)

  /**
   * Constructor for GetServiceByIdUseCase
   * @param serviceRepository - Repository for service operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly serviceRepository: IServiceRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute service retrieval by ID
   * @param id - Service ID
   * @returns Result with service response DTO or error
   */
  async execute(id: string): Promise<Result<ServiceResponseDto, ServiceNotFoundException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get service by ID use case', {
        serviceId: id,
        requestedBy: currentUserId,
        context: 'GetServiceByIdUseCase.execute',
      })

      const service = await this.serviceRepository.findById(id)
      if (!service) {
        const error = new ServiceNotFoundException(id)
        this.logger.warn('Service not found', {
          serviceId: id,
          requestedBy: currentUserId,
          context: 'GetServiceByIdUseCase.execute',
        })
        return new Failure(error)
      }

      const responseDto = ServiceMapper.toResponseDto(service)

      this.logger.log('Get service by ID use case completed successfully', {
        serviceId: id,
        name: responseDto.name,
        requestedBy: currentUserId,
        context: 'GetServiceByIdUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting service by ID', {
        serviceId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetServiceByIdUseCase.execute',
      })
      return new Failure(new ServiceNotFoundException(id))
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceResponseDto } from '@application/services/dto'
import { ServiceMapper } from '@application/services/mappers'
import { IServiceRepository, SERVICE_REPOSITORY } from '@domain/services/interfaces'
import { PaginatedResult } from '@shared/bases'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting all services
 * Handles the orchestration for service listing business process
 */
@Injectable()
export class GetAllServicesUseCase {
  private readonly logger = new Logger(GetAllServicesUseCase.name)

  /**
   * Constructor for GetAllServicesUseCase
   * @param serviceRepository - Repository for service operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly serviceRepository: IServiceRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute service listing
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @returns Result with paginated service response DTOs or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedResult<ServiceResponseDto>, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get all services use case', {
        page,
        limit,
        requestedBy: currentUserId,
        context: 'GetAllServicesUseCase.execute',
      })

      const servicesResult = await this.serviceRepository.findAll(page, limit)
      const responseDtos = servicesResult.data.map((service) =>
        ServiceMapper.toResponseDto(service),
      )

      const result: PaginatedResult<ServiceResponseDto> = {
        data: responseDtos,
        meta: servicesResult.meta,
      }

      this.logger.log('Get all services use case completed successfully', {
        serviceCount: responseDtos.length,
        totalPages: servicesResult.meta.totalPages,
        requestedBy: currentUserId,
        context: 'GetAllServicesUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error getting all services', {
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetAllServicesUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

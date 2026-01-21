import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceResponseDto } from '@application/services/dto'
import { ServiceMapper } from '@application/services/mappers'
import { IServiceRepository, SERVICE_REPOSITORY } from '@domain/services/interfaces'
import { PaginatedResult } from '@shared/bases'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for searching services by name
 * Orchestrates the business logic for searching services by name with pagination
 */
@Injectable()
export class SearchServicesByNameUseCase {
  private readonly logger = new Logger(SearchServicesByNameUseCase.name)

  /**
   * Constructor for SearchServicesByNameUseCase
   * @param serviceRepository - Repository for service operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly serviceRepository: IServiceRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the search services by name use case
   * @param name - Name to search for
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Promise resolving to Result with paginated services
   */
  async execute(
    name: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedResult<ServiceResponseDto>, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Search services by name use case started', {
        name,
        page,
        limit,
        requestedBy: currentUserId,
        context: 'SearchServicesByNameUseCase.execute',
      })

      const servicesResult = await this.serviceRepository.findByName(name, page, limit)
      const responseDtos = servicesResult.data.map((service) =>
        ServiceMapper.toResponseDto(service),
      )

      const result: PaginatedResult<ServiceResponseDto> = {
        data: responseDtos,
        meta: servicesResult.meta,
      }

      this.logger.log('Search services by name use case completed successfully', {
        name,
        totalServices: result.meta.total,
        pageSize: result.data.length,
        requestedBy: currentUserId,
        context: 'SearchServicesByNameUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error searching services by name', {
        name,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'SearchServicesByNameUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

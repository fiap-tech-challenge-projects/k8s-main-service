import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedClientsResponseDto } from '@application/clients/dto'
import { ClientMapper } from '@application/clients/mappers'
import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for searching clients by name
 * Handles the orchestration for client search by name business process
 */
@Injectable()
export class SearchClientsByNameUseCase {
  private readonly logger = new Logger(SearchClientsByNameUseCase.name)

  /**
   * Constructor for SearchClientsByNameUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute client search by name
   * @param name - Name to search for
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Result with paginated clients response or error
   */
  async execute(
    name: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedClientsResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing search clients by name use case', {
        name,
        page,
        limit,
        requestedBy: currentUserId,
        context: 'SearchClientsByNameUseCase.execute',
      })

      const paginatedResult = await this.clientRepository.findByName(name, page, limit)
      const result = {
        data: ClientMapper.toResponseDtoArray(paginatedResult.data),
        meta: paginatedResult.meta,
      }

      this.logger.log('Search clients by name use case completed successfully', {
        name,
        page,
        limit,
        count: result.data.length,
        total: result.meta.total,
        requestedBy: currentUserId,
        context: 'SearchClientsByNameUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error searching clients by name', {
        name,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'SearchClientsByNameUseCase.execute',
      })
      return new Failure(
        error instanceof Error ? error : new Error('Failed to search clients by name'),
      )
    }
  }
}

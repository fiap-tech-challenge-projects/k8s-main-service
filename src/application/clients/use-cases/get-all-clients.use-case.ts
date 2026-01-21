import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedClientsResponseDto } from '@application/clients/dto'
import { ClientMapper } from '@application/clients/mappers'
import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting all clients
 * Handles the orchestration for retrieving all clients with pagination
 */
@Injectable()
export class GetAllClientsUseCase {
  private readonly logger = new Logger(GetAllClientsUseCase.name)

  /**
   * Constructor for GetAllClientsUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute get all clients
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Result with paginated clients response or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedClientsResponseDto, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get all clients use case', {
        page,
        limit,
        requestedBy: currentUserId,
        context: 'GetAllClientsUseCase.execute',
      })

      const paginatedResult = await this.clientRepository.findAll(page, limit)
      const result = {
        data: ClientMapper.toResponseDtoArray(paginatedResult.data),
        meta: paginatedResult.meta,
      }

      this.logger.log('Get all clients use case completed successfully', {
        count: result.data.length,
        total: result.meta.total,
        requestedBy: currentUserId,
        context: 'GetAllClientsUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error getting all clients', {
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetAllClientsUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Failed to get all clients'))
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common'

import { ClientResponseDto } from '@application/clients/dto'
import { ClientMapper } from '@application/clients/mappers'
import { ClientNotFoundException } from '@domain/clients/exceptions'
import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting a client by ID
 * Handles the orchestration for client retrieval business process
 */
@Injectable()
export class GetClientByIdUseCase {
  private readonly logger = new Logger(GetClientByIdUseCase.name)

  /**
   * Constructor for GetClientByIdUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute client retrieval by ID
   * @param id - Client ID
   * @returns Result with client response DTO or error
   */
  async execute(id: string): Promise<Result<ClientResponseDto, ClientNotFoundException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get client by ID use case', {
        clientId: id,
        requestedBy: currentUserId,
        context: 'GetClientByIdUseCase.execute',
      })

      const client = await this.clientRepository.findById(id)
      if (!client) {
        const error = new ClientNotFoundException(id)
        this.logger.warn('Client not found', {
          clientId: id,
          requestedBy: currentUserId,
          context: 'GetClientByIdUseCase.execute',
        })
        return new Failure(error)
      }

      const responseDto = ClientMapper.toResponseDto(client)

      this.logger.log('Get client by ID use case completed successfully', {
        clientId: id,
        requestedBy: currentUserId,
        context: 'GetClientByIdUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting client by ID', {
        clientId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetClientByIdUseCase.execute',
      })
      return new Failure(new ClientNotFoundException(id))
    }
  }
}

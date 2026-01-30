import { Injectable, Logger, Inject } from '@nestjs/common'

import { ClientResponseDto } from '@application/clients/dto'
import { ClientMapper } from '@application/clients/mappers'
import { ClientNotFoundException } from '@domain/clients/exceptions'
import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting a client by email
 * Handles the orchestration for client retrieval by email business process
 */
@Injectable()
export class GetClientByEmailUseCase {
  private readonly logger = new Logger(GetClientByEmailUseCase.name)

  /**
   * Constructor for GetClientByEmailUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute client retrieval by email
   * @param email - Client email
   * @returns Result with client response DTO or error
   */
  async execute(email: string): Promise<Result<ClientResponseDto, ClientNotFoundException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get client by email use case', {
        email,
        requestedBy: currentUserId,
        context: 'GetClientByEmailUseCase.execute',
      })

      const client = await this.clientRepository.findByEmail(email)
      if (!client) {
        const error = new ClientNotFoundException(`email: ${email}`)
        this.logger.warn('Client not found by email', {
          email,
          requestedBy: currentUserId,
          context: 'GetClientByEmailUseCase.execute',
        })
        return new Failure(error)
      }

      const responseDto = ClientMapper.toResponseDto(client)

      this.logger.log('Get client by email use case completed successfully', {
        email,
        clientId: responseDto.id,
        requestedBy: currentUserId,
        context: 'GetClientByEmailUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting client by email', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetClientByEmailUseCase.execute',
      })
      return new Failure(new ClientNotFoundException(`email: ${email}`))
    }
  }
}

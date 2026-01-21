import { Injectable, Logger, Inject } from '@nestjs/common'

import { UpdateClientDto, ClientResponseDto } from '@application/clients/dto'
import { ClientMapper } from '@application/clients/mappers'
import { ClientNotFoundException, ClientAlreadyExistsException } from '@domain/clients/exceptions'
import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for updating a client
 * Handles the orchestration for client update business process
 */
@Injectable()
export class UpdateClientUseCase {
  private readonly logger = new Logger(UpdateClientUseCase.name)

  /**
   * Constructor for UpdateClientUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute client update
   * @param id - Client ID to update
   * @param updateClientDto - Client update data
   * @returns Result with client response DTO or domain exception
   */
  async execute(
    id: string,
    updateClientDto: UpdateClientDto,
  ): Promise<Result<ClientResponseDto, ClientNotFoundException | ClientAlreadyExistsException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing update client use case', {
        clientId: id,
        updateFields: Object.keys(updateClientDto),
        requestedBy: currentUserId,
        context: 'UpdateClientUseCase.execute',
      })

      const existingClient = await this.clientRepository.findById(id)
      if (!existingClient) {
        const error = new ClientNotFoundException(id)
        this.logger.warn('Client not found for update', {
          clientId: id,
          requestedBy: currentUserId,
          context: 'UpdateClientUseCase.execute',
        })
        return new Failure(error)
      }

      // Validate email uniqueness if email is being updated
      if (updateClientDto.email) {
        const emailExists = await this.clientRepository.emailExists(updateClientDto.email)
        if (emailExists) {
          throw new ClientAlreadyExistsException('email', updateClientDto.email)
        }
      }

      // Update the entity
      ClientMapper.fromUpdateDto(updateClientDto, existingClient)
      const savedClient = await this.clientRepository.update(id, existingClient)
      const responseDto = ClientMapper.toResponseDto(savedClient)

      this.logger.log('Client update use case completed successfully', {
        clientId: responseDto.id,
        email: responseDto.email,
        requestedBy: currentUserId,
        context: 'UpdateClientUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error updating client', {
        clientId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'UpdateClientUseCase.execute',
      })
      return new Failure(error instanceof DomainException ? error : new ClientNotFoundException(id))
    }
  }
}

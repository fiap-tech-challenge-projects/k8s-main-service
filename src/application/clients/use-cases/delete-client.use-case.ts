import { Injectable, Logger, Inject } from '@nestjs/common'

import { ClientNotFoundException } from '@domain/clients/exceptions'
import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for deleting a client
 * Handles the orchestration for client deletion business process
 */
@Injectable()
export class DeleteClientUseCase {
  private readonly logger = new Logger(DeleteClientUseCase.name)

  /**
   * Constructor for DeleteClientUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute client deletion
   * @param id - Client ID
   * @returns Result with boolean indicating success or error
   */
  async execute(id: string): Promise<Result<boolean, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing delete client use case', {
        clientId: id,
        requestedBy: currentUserId,
        context: 'DeleteClientUseCase.execute',
      })

      const existingClient = await this.clientRepository.findById(id)
      if (!existingClient) {
        const error = new ClientNotFoundException(id)
        this.logger.warn('Client not found for deletion', {
          clientId: id,
          requestedBy: currentUserId,
          context: 'DeleteClientUseCase.execute',
        })
        return new Failure(error)
      }

      const deleted = await this.clientRepository.delete(id)

      this.logger.log('Delete client use case completed successfully', {
        clientId: id,
        deleted,
        requestedBy: currentUserId,
        context: 'DeleteClientUseCase.execute',
      })

      return new Success(deleted)
    } catch (error) {
      this.logger.error('Error deleting client', {
        clientId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'DeleteClientUseCase.execute',
      })
      return new Failure(error instanceof DomainException ? error : new ClientNotFoundException(id))
    }
  }
}

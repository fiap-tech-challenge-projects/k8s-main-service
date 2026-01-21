import { Injectable, Logger, Inject } from '@nestjs/common'

import { ClientResponseDto } from '@application/clients/dto'
import { ClientMapper } from '@application/clients/mappers'
import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { CpfCnpj } from '@domain/clients/value-objects'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting a client by CPF/CNPJ
 * Handles the orchestration for client retrieval by CPF/CNPJ
 */
@Injectable()
export class GetClientByCpfCnpjUseCase {
  private readonly logger = new Logger(GetClientByCpfCnpjUseCase.name)

  /**
   * Constructor for GetClientByCpfCnpjUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute client retrieval by CPF/CNPJ
   * @param cpfCnpj - Client CPF/CNPJ
   * @returns Result with client response DTO or null if not found, or error
   */
  async execute(cpfCnpj: string): Promise<Result<ClientResponseDto | null, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get client by CPF/CNPJ use case', {
        cpfCnpj,
        requestedBy: currentUserId,
        context: 'GetClientByCpfCnpjUseCase.execute',
      })

      const cpfCnpjValue = CpfCnpj.create(cpfCnpj)
      const result = await this.clientRepository.findByCpfCnpj(cpfCnpjValue.value)
      const responseDto = result ? ClientMapper.toResponseDto(result) : null

      this.logger.log('Get client by CPF/CNPJ use case completed successfully', {
        cpfCnpj,
        found: responseDto !== null,
        requestedBy: currentUserId,
        context: 'GetClientByCpfCnpjUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error getting client by CPF/CNPJ', {
        cpfCnpj,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetClientByCpfCnpjUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

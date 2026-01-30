import { Injectable, Logger, Inject } from '@nestjs/common'

import { CreateClientDto, ClientResponseDto } from '@application/clients/dto'
import { ClientMapper } from '@application/clients/mappers'
import { ClientAlreadyExistsException } from '@domain/clients/exceptions'
import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { CpfCnpj } from '@domain/clients/value-objects'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'
import { Email } from '@shared/value-objects'

/**
 * Use case for creating a client
 * Handles the orchestration for client creation business process
 */
@Injectable()
export class CreateClientUseCase {
  private readonly logger = new Logger(CreateClientUseCase.name)

  /**
   * Constructor for CreateClientUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute client creation
   * @param createClientDto - Data for creating a new client
   * @returns Result with client response DTO or error
   */
  async execute(
    createClientDto: CreateClientDto,
  ): Promise<Result<ClientResponseDto, ClientAlreadyExistsException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing create client use case', {
        email: createClientDto.email,
        cpfCnpj: createClientDto.cpfCnpj,
        requestedBy: currentUserId,
        context: 'CreateClientUseCase.execute',
      })

      const email = Email.create(createClientDto.email)
      const cpfCnpj = CpfCnpj.create(createClientDto.cpfCnpj)

      const existingClientByEmail = await this.clientRepository.findByEmail(email.value)
      if (existingClientByEmail) {
        return new Failure(new ClientAlreadyExistsException('email', createClientDto.email))
      }

      const existingClientByCpfCnpj = await this.clientRepository.findByCpfCnpj(cpfCnpj.value)
      if (existingClientByCpfCnpj) {
        return new Failure(new ClientAlreadyExistsException('cpfCnpj', createClientDto.cpfCnpj))
      }

      const client = ClientMapper.fromCreateDto(createClientDto)
      const savedClient = await this.clientRepository.create(client)
      const responseDto = ClientMapper.toResponseDto(savedClient)

      this.logger.log('Create client use case completed successfully', {
        clientId: responseDto.id,
        email: responseDto.email,
        requestedBy: currentUserId,
        context: 'CreateClientUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error creating client', {
        error: error instanceof Error ? error.message : 'Unknown error',
        createClientDto,
        context: 'CreateClientUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Failed to create client'))
    }
  }
}

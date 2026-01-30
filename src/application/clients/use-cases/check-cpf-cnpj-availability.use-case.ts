import { Injectable, Logger, Inject } from '@nestjs/common'

import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for checking CPF/CNPJ availability
 * Handles the orchestration for CPF/CNPJ availability check business process
 */
@Injectable()
export class CheckCpfCnpjAvailabilityUseCase {
  private readonly logger = new Logger(CheckCpfCnpjAvailabilityUseCase.name)

  /**
   * Constructor for CheckCpfCnpjAvailabilityUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute CPF/CNPJ availability check
   * @param cpfCnpj - CPF/CNPJ to check
   * @returns Result with boolean indicating if CPF/CNPJ is available
   */
  async execute(cpfCnpj: string): Promise<Result<boolean, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing check CPF/CNPJ availability use case', {
        cpfCnpj,
        requestedBy: currentUserId,
        context: 'CheckCpfCnpjAvailabilityUseCase.execute',
      })

      const cpfCnpjExists = await this.clientRepository.cpfCnpjExists(cpfCnpj)
      const isAvailable = !cpfCnpjExists

      this.logger.log('Check CPF/CNPJ availability use case completed successfully', {
        cpfCnpj,
        isAvailable,
        requestedBy: currentUserId,
        context: 'CheckCpfCnpjAvailabilityUseCase.execute',
      })

      return new Success(isAvailable)
    } catch (error) {
      this.logger.error('Error checking CPF/CNPJ availability', {
        cpfCnpj,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'CheckCpfCnpjAvailabilityUseCase.execute',
      })
      return new Failure(
        error instanceof Error ? error : new Error('Failed to check CPF/CNPJ availability'),
      )
    }
  }
}

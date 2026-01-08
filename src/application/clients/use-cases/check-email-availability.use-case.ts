import { Injectable, Logger, Inject } from '@nestjs/common'

import { IClientRepository, CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for checking email availability
 * Handles the orchestration for email availability check business process
 */
@Injectable()
export class CheckEmailAvailabilityUseCase {
  private readonly logger = new Logger(CheckEmailAvailabilityUseCase.name)

  /**
   * Constructor for CheckEmailAvailabilityUseCase
   * @param clientRepository - Repository for client operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute email availability check
   * @param email - Email to check
   * @returns Result with boolean indicating if email is available
   */
  async execute(email: string): Promise<Result<boolean, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing check email availability use case', {
        email,
        requestedBy: currentUserId,
        context: 'CheckEmailAvailabilityUseCase.execute',
      })

      const emailExists = await this.clientRepository.emailExists(email)
      const isAvailable = !emailExists

      this.logger.log('Check email availability use case completed successfully', {
        email,
        isAvailable,
        requestedBy: currentUserId,
        context: 'CheckEmailAvailabilityUseCase.execute',
      })

      return new Success(isAvailable)
    } catch (error) {
      this.logger.error('Error checking email availability', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'CheckEmailAvailabilityUseCase.execute',
      })
      return new Failure(
        error instanceof Error ? error : new Error('Failed to check email availability'),
      )
    }
  }
}

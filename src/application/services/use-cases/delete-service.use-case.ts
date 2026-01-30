import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceNotFoundException } from '@domain/services/exceptions'
import { IServiceRepository, SERVICE_REPOSITORY } from '@domain/services/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for deleting a service
 * Orchestrates the business logic for deleting an existing service
 */
@Injectable()
export class DeleteServiceUseCase {
  private readonly logger = new Logger(DeleteServiceUseCase.name)

  /**
   * Constructor for DeleteServiceUseCase
   * @param serviceRepository - Repository for service operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly serviceRepository: IServiceRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the delete service use case
   * @param id - Service ID
   * @returns Promise resolving to Result with boolean on success
   */
  async execute(id: string): Promise<Result<boolean, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing delete service use case', {
        serviceId: id,
        requestedBy: currentUserId,
        context: 'DeleteServiceUseCase.execute',
      })

      // Check if service exists
      const existingService = await this.serviceRepository.findById(id)
      if (!existingService) {
        const error = new ServiceNotFoundException(id)
        this.logger.warn('Service not found for deletion', {
          serviceId: id,
          requestedBy: currentUserId,
          context: 'DeleteServiceUseCase.execute',
        })
        return new Failure(error)
      }

      await this.serviceRepository.delete(id)

      this.logger.log('Service deletion use case completed successfully', {
        serviceId: id,
        requestedBy: currentUserId,
        context: 'DeleteServiceUseCase.execute',
      })

      return new Success(true)
    } catch (error) {
      this.logger.error('Error deleting service', {
        serviceId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'DeleteServiceUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

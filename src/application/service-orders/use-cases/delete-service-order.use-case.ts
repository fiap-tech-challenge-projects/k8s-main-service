import { Inject, Injectable, Logger } from '@nestjs/common'

import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for deleting a service order
 * Orchestrates the business logic for deleting an existing service order
 */
@Injectable()
export class DeleteServiceOrderUseCase {
  private readonly logger = new Logger(DeleteServiceOrderUseCase.name)

  /**
   * Constructor for DeleteServiceOrderUseCase
   * @param serviceOrderRepository - Service order repository for data access
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the delete service order use case
   * @param id - Service order ID
   * @returns Promise resolving to Result with boolean on success
   */
  async execute(id: string): Promise<Result<boolean, ServiceOrderNotFoundException | Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Deleting service order', {
        serviceOrderId: id,
        requestedBy: currentUserId,
        context: 'DeleteServiceOrderUseCase.execute',
      })

      // Check if service order exists
      const existingServiceOrder = await this.serviceOrderRepository.findById(id)
      if (!existingServiceOrder) {
        const error = new ServiceOrderNotFoundException(id)
        this.logger.warn('Service order not found for deletion', {
          serviceOrderId: id,
          requestedBy: currentUserId,
          context: 'DeleteServiceOrderUseCase.execute',
        })
        return FAILURE(error)
      }

      // Delete service order
      await this.serviceOrderRepository.delete(id)

      this.logger.log('Service order deleted successfully', {
        serviceOrderId: id,
        requestedBy: currentUserId,
        context: 'DeleteServiceOrderUseCase.execute',
      })

      return SUCCESS(true)
    } catch (error) {
      this.logger.error('Error deleting service order', {
        serviceOrderId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'DeleteServiceOrderUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

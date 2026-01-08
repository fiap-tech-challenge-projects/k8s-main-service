import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceOrderResponseDto } from '@application/service-orders/dto'
import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { ServiceOrderStatus } from '@domain/service-orders/value-objects'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for updating service order status
 * Handles the orchestration for service order status change business process
 */
@Injectable()
export class UpdateServiceOrderStatusUseCase {
  private readonly logger = new Logger(UpdateServiceOrderStatusUseCase.name)

  /**
   * Constructor for UpdateServiceOrderStatusUseCase
   * @param serviceOrderRepository - Service order repository for data access
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute service order status update
   * @param id - Service order ID
   * @param status - New status
   * @param changedBy - User ID who made the change
   * @returns Result with updated service order response DTO or error
   */
  async execute(
    id: string,
    status: ServiceOrderStatus,
    changedBy: string,
  ): Promise<Result<ServiceOrderResponseDto, ServiceOrderNotFoundException | Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing update service order status use case', {
        serviceOrderId: id,
        newStatus: status,
        changedBy,
        requestedBy: currentUserId,
        context: 'UpdateServiceOrderStatusUseCase.execute',
      })

      // Check if service order exists
      const existingServiceOrder = await this.serviceOrderRepository.findById(id)
      if (!existingServiceOrder) {
        const error = new ServiceOrderNotFoundException(id)
        this.logger.warn('Service order not found for status update', {
          serviceOrderId: id,
          newStatus: status,
          requestedBy: currentUserId,
          context: 'UpdateServiceOrderStatusUseCase.execute',
        })
        return FAILURE(error)
      }

      // Update service order status with business validation
      existingServiceOrder.updateStatus(status)
      const savedServiceOrder = await this.serviceOrderRepository.update(id, existingServiceOrder)
      const responseDto = ServiceOrderMapper.toResponseDto(savedServiceOrder)

      this.logger.log('Service order status update use case completed successfully', {
        serviceOrderId: responseDto.id,
        status: responseDto.status,
        requestedBy: currentUserId,
        context: 'UpdateServiceOrderStatusUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Error updating service order status', {
        serviceOrderId: id,
        newStatus: status,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'UpdateServiceOrderStatusUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

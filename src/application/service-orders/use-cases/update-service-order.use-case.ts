import { Injectable, Logger, Inject } from '@nestjs/common'

import { UpdateServiceOrderDto, ServiceOrderResponseDto } from '@application/service-orders/dto'
import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { ServiceOrderStatusChangeValidator } from '@domain/service-orders/validators'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for updating a service order
 * Handles the orchestration for service order update business process
 */
@Injectable()
export class UpdateServiceOrderUseCase {
  private readonly logger = new Logger(UpdateServiceOrderUseCase.name)

  /**
   * Constructor for UpdateServiceOrderUseCase
   * @param serviceOrderRepository - Service order repository for data access
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute service order update
   * @param id - Service order ID to update
   * @param updateServiceOrderDto - Service order update data
   * @returns Result with service order response DTO or error
   */
  async execute(
    id: string,
    updateServiceOrderDto: UpdateServiceOrderDto,
  ): Promise<Result<ServiceOrderResponseDto, ServiceOrderNotFoundException | Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()
      const currentUserRole = this.userContextService.getUserRole()

      this.logger.log('Executing update service order use case', {
        serviceOrderId: id,
        updateFields: Object.keys(updateServiceOrderDto),
        requestedBy: currentUserId,
        userRole: currentUserRole,
        context: 'UpdateServiceOrderUseCase.execute',
      })

      // Check if service order exists
      const existingServiceOrder = await this.serviceOrderRepository.findById(id)
      if (!existingServiceOrder) {
        const error = new ServiceOrderNotFoundException(id)
        this.logger.warn('Service order not found for update', {
          serviceOrderId: id,
          requestedBy: currentUserId,
          context: 'UpdateServiceOrderUseCase.execute',
        })
        return FAILURE(error)
      }

      // Validate authorization for status changes
      if (updateServiceOrderDto.status && currentUserRole) {
        ServiceOrderStatusChangeValidator.validateRoleCanChangeStatus(
          existingServiceOrder.status,
          updateServiceOrderDto.status,
          currentUserRole,
          id,
        )
      }

      // Update service order with new data
      const updatedServiceOrder = ServiceOrderMapper.fromUpdateDto(
        existingServiceOrder,
        updateServiceOrderDto,
      )
      const savedServiceOrder = await this.serviceOrderRepository.update(id, updatedServiceOrder)
      const responseDto = ServiceOrderMapper.toResponseDto(savedServiceOrder)

      this.logger.log('Service order update use case completed successfully', {
        serviceOrderId: responseDto.id,
        status: responseDto.status,
        requestedBy: currentUserId,
        context: 'UpdateServiceOrderUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Error updating service order', {
        serviceOrderId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'UpdateServiceOrderUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

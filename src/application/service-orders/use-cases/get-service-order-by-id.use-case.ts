import { Injectable, Logger, Inject } from '@nestjs/common'

import { ServiceOrderResponseDto } from '@application/service-orders/dto'
import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for getting a service order by ID
 * Handles the orchestration for service order retrieval by ID
 */
@Injectable()
export class GetServiceOrderByIdUseCase {
  private readonly logger = new Logger(GetServiceOrderByIdUseCase.name)

  /**
   * Constructor for GetServiceOrderByIdUseCase
   * @param serviceOrderRepository - Service order repository for data access
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
  ) {}

  /**
   * Execute service order retrieval by ID
   * @param id - Service order ID
   * @returns Result with service order response DTO or exception
   */
  async execute(
    id: string,
  ): Promise<Result<ServiceOrderResponseDto, ServiceOrderNotFoundException>> {
    this.logger.log('Executing get service order by ID use case', {
      serviceOrderId: id,
      context: 'GetServiceOrderByIdUseCase.execute',
    })

    try {
      const serviceOrder = await this.serviceOrderRepository.findById(id)

      if (!serviceOrder) {
        const error = new ServiceOrderNotFoundException(id)
        this.logger.warn('Service order not found', {
          serviceOrderId: id,
          context: 'GetServiceOrderByIdUseCase.execute',
        })
        return FAILURE(error)
      }

      const responseDto = ServiceOrderMapper.toResponseDto(serviceOrder)

      this.logger.log('Get service order by ID use case completed successfully', {
        serviceOrderId: responseDto.id,
        status: responseDto.status,
        vehicleId: responseDto.vehicleId,
        context: 'GetServiceOrderByIdUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorType = error instanceof Error ? error.constructor.name : 'Error'

      this.logger.error('Get service order by ID use case failed', {
        serviceOrderId: id,
        error: errorMessage,
        errorType,
        context: 'GetServiceOrderByIdUseCase.execute',
      })

      if (error instanceof ServiceOrderNotFoundException) {
        return FAILURE(error)
      }

      return FAILURE(new ServiceOrderNotFoundException(id))
    }
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common'
import { ServiceOrderStatus } from '@prisma/client'

import { ServiceOrderMapper } from '@application/service-orders/mappers'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

import { PaginatedServiceOrdersResponseDto } from '../dto'

/**
 * Use case for getting service orders by status
 * Orchestrates the business logic for filtering service orders by status with pagination
 */
@Injectable()
export class GetServiceOrdersByStatusUseCase {
  private readonly logger = new Logger(GetServiceOrdersByStatusUseCase.name)

  /**
   * Constructor for GetServiceOrdersByStatusUseCase
   * @param serviceOrderRepository - Service order repository for data access
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
  ) {}

  /**
   * Execute the get service orders by status use case
   * @param status - Status to filter by
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Promise resolving to Result with paginated service orders response
   */
  async execute(
    status: ServiceOrderStatus,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedServiceOrdersResponseDto, Error>> {
    try {
      this.logger.log('Retrieving service orders by status', {
        status,
        page,
        limit,
        context: 'GetServiceOrdersByStatusUseCase.execute',
      })

      const paginatedResult = await this.serviceOrderRepository.findByStatus(status, page, limit)

      const serviceOrders = paginatedResult.data.map((serviceOrder) =>
        ServiceOrderMapper.toResponseDto(serviceOrder),
      )

      const responseDto: PaginatedServiceOrdersResponseDto = {
        data: serviceOrders,
        meta: paginatedResult.meta,
      }

      this.logger.log('Service orders by status retrieved successfully', {
        status,
        total: responseDto.meta.total,
        page: responseDto.meta.page,
        context: 'GetServiceOrdersByStatusUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Error retrieving service orders by status', {
        status,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetServiceOrdersByStatusUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

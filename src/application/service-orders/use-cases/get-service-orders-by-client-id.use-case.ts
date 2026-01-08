import { Inject, Injectable, Logger } from '@nestjs/common'

import { ServiceOrderMapper } from '@application/service-orders/mappers'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

import { PaginatedServiceOrdersResponseDto } from '../dto'

/**
 * Use case for getting service orders by client ID
 * Orchestrates the business logic for filtering service orders by client ID with pagination
 */
@Injectable()
export class GetServiceOrdersByClientIdUseCase {
  private readonly logger = new Logger(GetServiceOrdersByClientIdUseCase.name)

  /**
   * Constructor for GetServiceOrdersByClientIdUseCase
   * @param serviceOrderRepository - Service order repository for data access
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
  ) {}

  /**
   * Execute the get service orders by client ID use case
   * @param clientId - Client ID to filter by
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Promise resolving to Result with paginated service orders response
   */
  async execute(
    clientId: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedServiceOrdersResponseDto, Error>> {
    try {
      this.logger.log('Retrieving service orders by client ID', {
        clientId,
        page,
        limit,
        context: 'GetServiceOrdersByClientIdUseCase.execute',
      })

      const paginatedResult = await this.serviceOrderRepository.findByClientId(
        clientId,
        page,
        limit,
      )

      const serviceOrders = paginatedResult.data.map((serviceOrder) =>
        ServiceOrderMapper.toResponseDto(serviceOrder),
      )

      const responseDto: PaginatedServiceOrdersResponseDto = {
        data: serviceOrders,
        meta: paginatedResult.meta,
      }

      this.logger.log('Service orders by client ID retrieved successfully', {
        clientId,
        total: responseDto.meta.total,
        page: responseDto.meta.page,
        context: 'GetServiceOrdersByClientIdUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Error retrieving service orders by client ID', {
        clientId,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetServiceOrdersByClientIdUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

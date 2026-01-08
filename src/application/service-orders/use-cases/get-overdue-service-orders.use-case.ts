import { Inject, Injectable, Logger } from '@nestjs/common'

import { ServiceOrderMapper } from '@application/service-orders/mappers'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

import { PaginatedServiceOrdersResponseDto } from '../dto'

/**
 * Use case for getting overdue service orders
 * Orchestrates the business logic for retrieving overdue service orders with pagination
 */
@Injectable()
export class GetOverdueServiceOrdersUseCase {
  private readonly logger = new Logger(GetOverdueServiceOrdersUseCase.name)

  /**
   * Constructor for GetOverdueServiceOrdersUseCase
   * @param serviceOrderRepository - Service order repository for data access
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
  ) {}

  /**
   * Execute the get overdue service orders use case
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Promise resolving to Result with paginated service orders response
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedServiceOrdersResponseDto, Error>> {
    try {
      this.logger.log('Retrieving overdue service orders', {
        page,
        limit,
        context: 'GetOverdueServiceOrdersUseCase.execute',
      })

      const paginatedResult = await this.serviceOrderRepository.findOverdue(page, limit)

      const serviceOrders = paginatedResult.data.map((serviceOrder) =>
        ServiceOrderMapper.toResponseDto(serviceOrder),
      )

      const responseDto: PaginatedServiceOrdersResponseDto = {
        data: serviceOrders,
        meta: paginatedResult.meta,
      }

      this.logger.log('Overdue service orders retrieved successfully', {
        total: responseDto.meta.total,
        page: responseDto.meta.page,
        context: 'GetOverdueServiceOrdersUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Error retrieving overdue service orders', {
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetOverdueServiceOrdersUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

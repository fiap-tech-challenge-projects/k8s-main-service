import { Injectable, Inject, Logger } from '@nestjs/common'

import { PaginatedServiceOrdersResponseDto } from '@application/service-orders/dto'
import { ServiceOrderMapper } from '@application/service-orders/mappers'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for retrieving all service orders with pagination
 * Orchestrates the retrieval process with proper error handling
 */
@Injectable()
export class GetAllServiceOrdersUseCase {
  private readonly logger = new Logger(GetAllServiceOrdersUseCase.name)

  /**
   * Constructor for GetAllServiceOrdersUseCase
   * @param serviceOrderRepository - Repository for service order data access
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
  ) {}

  /**
   * Execute the get all service orders use case
   * @param page - Page number for pagination (optional)
   * @param limit - Number of items per page (optional)
   * @returns Result with paginated service orders response or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedServiceOrdersResponseDto, Error>> {
    try {
      this.logger.log('Retrieving all service orders', {
        page,
        limit,
        context: 'GetAllServiceOrdersUseCase.execute',
      })

      const paginatedResult = await this.serviceOrderRepository.findAll(page, limit)

      const serviceOrders = paginatedResult.data.map((serviceOrder) =>
        ServiceOrderMapper.toResponseDto(serviceOrder),
      )

      const responseDto: PaginatedServiceOrdersResponseDto = {
        data: serviceOrders,
        meta: paginatedResult.meta,
      }

      this.logger.log('Service orders retrieved successfully', {
        total: responseDto.meta.total,
        totalPages: responseDto.meta.totalPages,
        page: responseDto.meta.page,
        context: 'GetAllServiceOrdersUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorType = error instanceof Error ? error.constructor.name : 'Error'

      this.logger.error('Get all service orders use case failed', {
        page,
        limit,
        error: errorMessage,
        errorType,
        context: 'GetAllServiceOrdersUseCase.execute',
      })

      return FAILURE(new Error('Failed to retrieve service orders'))
    }
  }
}

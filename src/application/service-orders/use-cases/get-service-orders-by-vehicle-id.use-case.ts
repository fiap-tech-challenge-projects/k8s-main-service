import { Inject, Injectable, Logger } from '@nestjs/common'

import { ServiceOrderMapper } from '@application/service-orders/mappers'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

import { PaginatedServiceOrdersResponseDto } from '../dto'

/**
 * Use case for getting service orders by vehicle ID
 * Orchestrates the business logic for filtering service orders by vehicle ID with pagination
 */
@Injectable()
export class GetServiceOrdersByVehicleIdUseCase {
  private readonly logger = new Logger(GetServiceOrdersByVehicleIdUseCase.name)

  /**
   * Constructor for GetServiceOrdersByVehicleIdUseCase
   * @param serviceOrderRepository - Service order repository for data access
   */
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
  ) {}

  /**
   * Execute the get service orders by vehicle ID use case
   * @param vehicleId - Vehicle ID to filter by
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Promise resolving to Result with paginated service orders response
   */
  async execute(
    vehicleId: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedServiceOrdersResponseDto, Error>> {
    try {
      this.logger.log('Retrieving service orders by vehicle ID', {
        vehicleId,
        page,
        limit,
        context: 'GetServiceOrdersByVehicleIdUseCase.execute',
      })

      const paginatedResult = await this.serviceOrderRepository.findByVehicleId(
        vehicleId,
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

      this.logger.log('Service orders by vehicle ID retrieved successfully', {
        vehicleId,
        total: responseDto.meta.total,
        page: responseDto.meta.page,
        context: 'GetServiceOrdersByVehicleIdUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Error retrieving service orders by vehicle ID', {
        vehicleId,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetServiceOrdersByVehicleIdUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}

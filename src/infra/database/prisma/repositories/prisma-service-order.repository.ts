import { Injectable } from '@nestjs/common'
import { ServiceOrder as PrismaServiceOrder, ServiceOrderStatus } from '@prisma/client'

import { ServiceOrder } from '@domain/service-orders/entities'
import { IServiceOrderRepository } from '@domain/service-orders/interfaces'
import { BasePrismaRepository } from '@infra/database/common'
import { ServiceOrderMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PaginatedResult } from '@shared'

/** Prisma implementation of service order repository */
@Injectable()
export class PrismaServiceOrderRepository
  extends BasePrismaRepository<ServiceOrder, PrismaServiceOrder>
  implements IServiceOrderRepository
{
  /**
   * Creates a new instance of PrismaServiceOrderRepository.
   * @param prisma - Prisma service instance for database operations
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaServiceOrderRepository.name)
  }

  protected get modelName(): string {
    return 'serviceOrder'
  }

  protected get mapper(): (prismaModel: PrismaServiceOrder) => ServiceOrder {
    return ServiceOrderMapper.toDomain
  }

  protected get createMapper(): (entity: ServiceOrder) => Record<string, unknown> {
    return ServiceOrderMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: ServiceOrder) => Record<string, unknown> {
    return ServiceOrderMapper.toPrismaUpdate
  }

  /**
   * Find service orders by status
   * @param status - The status to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByStatus(
    status: ServiceOrderStatus,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceOrder>> {
    try {
      return this.findPaginated(
        {
          status,
        },
        page,
        limit,
        { requestDate: 'desc' },
      )
    } catch (error) {
      this.logger.error(`Error finding service orders by status ${status}:`, error)
      throw error
    }
  }

  /**
   * Find service orders by client ID
   * @param clientId - The client ID to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByClientId(
    clientId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceOrder>> {
    try {
      return this.findPaginated(
        {
          clientId,
        },
        page,
        limit,
        { requestDate: 'desc' },
      )
    } catch (error) {
      this.logger.error(`Error finding service orders by client ID ${clientId}:`, error)
      throw error
    }
  }

  /**
   * Find service orders by vehicle ID
   * @param vehicleId - The vehicle ID to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByVehicleId(
    vehicleId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceOrder>> {
    try {
      return this.findPaginated(
        {
          vehicleId,
        },
        page,
        limit,
        { requestDate: 'desc' },
      )
    } catch (error) {
      this.logger.error(`Error finding service orders by vehicle ID ${vehicleId}:`, error)
      throw error
    }
  }

  /**
   * Find service orders by date range
   * @param startDate - Start date for the range
   * @param endDate - End date for the range
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceOrder>> {
    try {
      return this.findPaginated(
        {
          requestDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        page,
        limit,
        { requestDate: 'desc' },
      )
    } catch (error) {
      this.logger.error(
        `Error finding service orders by date range ${startDate} to ${endDate}:`,
        error,
      )
      throw error
    }
  }

  /**
   * Find service orders that are overdue (past delivery date)
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findOverdue(page?: number, limit?: number): Promise<PaginatedResult<ServiceOrder>> {
    try {
      const now = new Date()
      return this.findPaginated(
        {
          deliveryDate: {
            lt: now,
          },
          status: {
            notIn: [ServiceOrderStatus.DELIVERED, ServiceOrderStatus.CANCELLED],
          },
        },
        page,
        limit,
        { deliveryDate: 'asc' },
      )
    } catch (error) {
      this.logger.error('Error finding overdue service orders:', error)
      throw error
    }
  }
}

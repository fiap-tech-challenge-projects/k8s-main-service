import { Injectable } from '@nestjs/common'
import { ServiceExecution as PrismaServiceExecution } from '@prisma/client'

import { ServiceExecution, ServiceExecutionRepositoryInterface } from '@domain/service-executions'
import { BasePrismaRepository } from '@infra/database/common'
import { ServiceExecutionMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PaginatedResult } from '@shared/bases'

/**
 * Prisma implementation of the ServiceExecution repository
 */
@Injectable()
export class PrismaServiceExecutionRepository
  extends BasePrismaRepository<ServiceExecution, PrismaServiceExecution>
  implements ServiceExecutionRepositoryInterface
{
  /**
   * Constructor for PrismaServiceExecutionRepository
   * @param prisma - The Prisma service dependency
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaServiceExecutionRepository.name)
  }

  protected get modelName(): string {
    return 'serviceExecution'
  }

  protected get mapper(): (prismaModel: PrismaServiceExecution) => ServiceExecution {
    return ServiceExecutionMapper.toDomain
  }

  protected get createMapper(): (entity: ServiceExecution) => Record<string, unknown> {
    return ServiceExecutionMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: ServiceExecution) => Record<string, unknown> {
    return ServiceExecutionMapper.toPrismaUpdate
  }

  /**
   * Find service execution by service order ID
   * @param serviceOrderId - The service order ID
   * @returns Promise resolving to the service execution or null if not found
   */
  async findByServiceOrderId(serviceOrderId: string): Promise<ServiceExecution | null> {
    try {
      return this.findByUniqueField('serviceOrderId', serviceOrderId)
    } catch (error) {
      this.logger.error(
        `Error finding service execution by service order ID ${serviceOrderId}:`,
        error,
      )
      throw error
    }
  }

  /**
   * Find service executions by service order ID with pagination
   * @param serviceOrderId - The service order ID
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Promise resolving to paginated service executions
   */
  async findByServiceOrderIdPaginated(
    serviceOrderId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceExecution>> {
    try {
      return await this.findPaginated({ serviceOrderId }, page, limit)
    } catch (error) {
      this.logger.error(
        `Error finding service executions by service order ID ${serviceOrderId} with pagination:`,
        error,
      )
      throw error
    }
  }

  /**
   * Find service executions by mechanic ID
   * @param mechanicId - The mechanic ID
   * @returns Promise resolving to an array of service executions
   */
  async findByMechanicId(mechanicId: string): Promise<ServiceExecution[]> {
    try {
      const result = await this.findPaginated({ mechanicId })
      return result.data
    } catch (error) {
      this.logger.error(`Error finding service executions by mechanic ID ${mechanicId}:`, error)
      throw error
    }
  }

  /**
   * Find in-progress service executions by mechanic ID
   * @param mechanicId - The mechanic ID
   * @returns Promise resolving to an array of in-progress service executions
   */
  async findInProgressByMechanicId(mechanicId: string): Promise<ServiceExecution[]> {
    try {
      const result = await this.findPaginated({
        mechanicId,
        status: 'IN_PROGRESS',
      })
      return result.data
    } catch (error) {
      this.logger.error(
        `Error finding in-progress service executions by mechanic ID ${mechanicId}:`,
        error,
      )
      throw error
    }
  }
}

import { Injectable } from '@nestjs/common'
import { Service as PrismaServiceEntity } from '@prisma/client'

import { Service } from '@domain/services/entities'
import { IServiceRepository } from '@domain/services/interfaces'
import { BasePrismaRepository } from '@infra/database/common'
import { ServiceMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PaginatedResult } from '@shared'

/**
 * Prisma implementation of the service repository
 */
@Injectable()
export class PrismaServiceRepository
  extends BasePrismaRepository<Service, PrismaServiceEntity>
  implements IServiceRepository
{
  /**
   * Constructor for PrismaServiceRepository
   * @param prisma - The Prisma service dependency
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaServiceRepository.name)
  }

  protected get modelName(): string {
    return 'service'
  }

  protected get mapper(): (prismaModel: PrismaServiceEntity) => Service {
    return ServiceMapper.toDomain
  }

  protected get createMapper(): (entity: Service) => Record<string, unknown> {
    return ServiceMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: Service) => Record<string, unknown> {
    return ServiceMapper.toPrismaUpdate
  }

  /**
   * Finds services by name with pagination
   * @param name - The name to search for
   * @param page - The page number for pagination
   * @param limit - The number of items per page
   * @returns A paginated result containing the services matching the name
   */
  async findByName(name: string, page?: number, limit?: number): Promise<PaginatedResult<Service>> {
    try {
      const currentPage = page ?? 1
      const currentLimit = limit ?? 10
      const skip = (currentPage - 1) * currentLimit

      const total = await this.prisma.service.count({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      })

      const servicesData = await this.prisma.service.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip,
        take: currentLimit,
      })

      // Map data and filter out invalid records
      const validService: Service[] = []
      for (const serviceData of servicesData) {
        try {
          const service = ServiceMapper.toDomain(serviceData)
          validService.push(service)
        } catch (error) {
          this.logger.warn(`Skipping services with invalid data: ${serviceData.id}`, error)
          this.logger.error(`Error mapping service data for ID ${serviceData.id}:`, error)
          // Continue with other records
        }
      }

      const totalPages = Math.ceil(total / currentLimit)

      return {
        data: validService,
        meta: {
          page: currentPage,
          limit: currentLimit,
          total,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
      }
    } catch (error) {
      this.logger.error(`Error finding services by name ${name}:`, error)
      throw error
    }
  }
}

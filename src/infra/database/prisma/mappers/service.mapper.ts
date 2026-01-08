import { Service as PrismaService, Prisma } from '@prisma/client'

import { Service } from '@domain/services/entities'
import { Price, EstimatedDuration } from '@domain/services/value-objects'
import { validateBasePrismaMapper } from '@shared/bases'

type PrismaServiceCreateInput = Prisma.ServiceUncheckedCreateInput
type PrismaServiceUpdateInput = Prisma.ServiceUncheckedUpdateInput

/**
 * Mapper for converting between Prisma Service models and Service domain entities
 */
export class ServiceMapper {
  /**
   * Maps a Prisma Service entity to a Service domain entity.
   * @param prismaService - Prisma Service entity
   * @returns Mapped Service domain entity
   */
  static toDomain(prismaService: PrismaService): Service {
    if (!prismaService) {
      throw new Error('Prisma Service model cannot be null or undefined')
    }

    const price = Price.create(prismaService.price)
    const estimatedDuration = EstimatedDuration.create(Number(prismaService.estimatedDuration))

    return new Service(
      prismaService.id,
      prismaService.name,
      price,
      prismaService.description ?? '',
      estimatedDuration,
      prismaService.createdAt,
      prismaService.updatedAt,
    )
  }

  /**
   * Maps an array of Prisma Service entities to an array of Service domain entities.
   * @param prismaServices - Array of Prisma Service entities
   * @returns Array of mapped Service domain entities
   */
  static toDomainMany(prismaServices: PrismaService[]): Service[] {
    if (!Array.isArray(prismaServices)) return []

    return prismaServices
      .filter((service) => service !== null && service !== undefined)
      .map((service) => this.toDomain(service))
  }

  /**
   * Maps a Service domain entity to a Prisma Service create input.
   * @param service - Service domain entity
   * @returns Mapped Prisma Service create input
   */
  static toPrismaCreate(service: Service): PrismaServiceCreateInput {
    if (!service) {
      throw new Error('Service domain entity cannot be null or undefined')
    }

    return {
      name: service.name,
      price: service.price.getValue(),
      description: service.description ?? '',
      estimatedDuration: service.estimatedDuration.getValue(),
    }
  }
  /**
   * Maps a Service domain entity to a Prisma Service update input.
   * @param service - Service domain entity
   * @returns Mapped Prisma Service update input
   */
  static toPrismaUpdate(service: Service): PrismaServiceUpdateInput {
    if (!service) {
      throw new Error('Service domain entity cannot be null or undefined')
    }

    return {
      id: service.id,
      name: service.name,
      price: service.price.getValue(),
      description: service.description ?? '',
      estimatedDuration: service.estimatedDuration.getValue(),
      updatedAt: service.updatedAt,
    }
  }
}

// Validate that this mapper implements the required contract
validateBasePrismaMapper<
  Service,
  PrismaService,
  PrismaServiceCreateInput,
  PrismaServiceUpdateInput
>(ServiceMapper, 'ServiceMapper')

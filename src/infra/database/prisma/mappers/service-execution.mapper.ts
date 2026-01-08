import { ServiceExecution as PrismaServiceExecution, Prisma } from '@prisma/client'

import { ServiceExecution, ServiceExecutionStatus } from '@domain/service-executions'
import { validateBasePrismaMapper } from '@shared/bases'

type PrismaServiceExecutionCreateInput = Prisma.ServiceExecutionUncheckedCreateInput
type PrismaServiceExecutionUpdateInput = Prisma.ServiceExecutionUncheckedUpdateInput

/**
 * Mapper for converting between Prisma ServiceExecution models and ServiceExecution domain entities
 */
export class ServiceExecutionMapper {
  /**
   * Converts a Prisma ServiceExecution model to a ServiceExecution domain entity
   * @param prismaServiceExecution - The Prisma ServiceExecution model from the database
   * @returns ServiceExecution domain entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  static toDomain(prismaServiceExecution: PrismaServiceExecution): ServiceExecution {
    if (!prismaServiceExecution) {
      throw new Error('Prisma ServiceExecution model cannot be null or undefined')
    }

    return new ServiceExecution(
      prismaServiceExecution.id,
      prismaServiceExecution.serviceOrderId,
      prismaServiceExecution.status as ServiceExecutionStatus,
      prismaServiceExecution.startTime ?? undefined,
      prismaServiceExecution.endTime ?? undefined,
      prismaServiceExecution.notes ?? undefined,
      prismaServiceExecution.mechanicId ?? undefined,
      prismaServiceExecution.createdAt,
      prismaServiceExecution.updatedAt,
    )
  }

  /**
   * Converts multiple Prisma ServiceExecution models to ServiceExecution domain entities
   * @param prismaServiceExecutions - Array of Prisma ServiceExecution models
   * @returns Array of ServiceExecution domain entities
   */
  static toDomainMany(prismaServiceExecutions: PrismaServiceExecution[]): ServiceExecution[] {
    if (!Array.isArray(prismaServiceExecutions)) {
      return []
    }

    return prismaServiceExecutions
      .filter((serviceExecution) => serviceExecution !== null && serviceExecution !== undefined)
      .map((serviceExecution) => this.toDomain(serviceExecution))
  }

  /**
   * Converts a ServiceExecution domain entity to Prisma create data
   * @param serviceExecution - The ServiceExecution domain entity to convert
   * @returns Prisma create input data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaCreate(serviceExecution: ServiceExecution): PrismaServiceExecutionCreateInput {
    if (!serviceExecution) {
      throw new Error('ServiceExecution domain entity cannot be null or undefined')
    }

    return {
      serviceOrderId: serviceExecution.serviceOrderId,
      status: serviceExecution.status,
      startTime: serviceExecution.startTime ?? null,
      endTime: serviceExecution.endTime ?? null,
      notes: serviceExecution.notes ?? null,
      mechanicId: serviceExecution.mechanicId ?? null,
    }
  }

  /**
   * Converts a ServiceExecution domain entity to Prisma update data
   * @param serviceExecution - The ServiceExecution domain entity to convert
   * @returns Prisma update input data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaUpdate(serviceExecution: ServiceExecution): PrismaServiceExecutionUpdateInput {
    if (!serviceExecution) {
      throw new Error('ServiceExecution domain entity cannot be null or undefined')
    }

    return {
      serviceOrderId: serviceExecution.serviceOrderId,
      status: serviceExecution.status,
      startTime: serviceExecution.startTime ?? null,
      endTime: serviceExecution.endTime ?? null,
      notes: serviceExecution.notes ?? null,
      mechanicId: serviceExecution.mechanicId ?? null,
      updatedAt: new Date(),
    }
  }
}

// Validate that this mapper implements the required contract
validateBasePrismaMapper<
  ServiceExecution,
  PrismaServiceExecution,
  PrismaServiceExecutionCreateInput,
  PrismaServiceExecutionUpdateInput
>(ServiceExecutionMapper, 'ServiceExecutionMapper')

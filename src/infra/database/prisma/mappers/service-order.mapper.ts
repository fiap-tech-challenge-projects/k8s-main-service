import { ServiceOrder as PrismaServiceOrder, Prisma } from '@prisma/client'

import { ServiceOrder } from '@domain/service-orders/entities'
import { validateBasePrismaMapper } from '@shared/bases'

type PrismaServiceOrderCreateInput = Prisma.ServiceOrderUncheckedCreateInput
type PrismaServiceOrderUpdateInput = Prisma.ServiceOrderUncheckedUpdateInput

/**
 * Mapper class for converting between Prisma ServiceOrder and ServiceOrder domain entities.
 */
export class ServiceOrderMapper {
  /**
   * Maps a Prisma ServiceOrder entity to a ServiceOrder domain entity.
   * @param model - Prisma ServiceOrder entity to convert
   * @returns Mapped ServiceOrder domain entity
   */
  static toDomain(model: PrismaServiceOrder): ServiceOrder {
    if (!model) {
      throw new Error('Prisma ServiceOrder model cannot be null or undefined')
    }
    return new ServiceOrder(
      model.id,
      model.status,
      model.requestDate,
      model.deliveryDate ?? undefined,
      model.cancellationReason ?? undefined,
      model.notes ?? undefined,
      model.clientId,
      model.vehicleId,
      model.createdAt,
      model.updatedAt,
    )
  }

  /**
   * Maps an array of Prisma ServiceOrder entities to an array of ServiceOrder domain entities.
   * @param models - Array of Prisma ServiceOrder entities to convert
   * @returns Array of mapped ServiceOrder domain entities
   */
  static toDomainMany(models: PrismaServiceOrder[]): ServiceOrder[] {
    if (!Array.isArray(models)) return []
    return models
      .filter((model) => model !== null && model !== undefined)
      .map((model) => this.toDomain(model))
  }

  /**
   * Maps a ServiceOrder domain entity to a Prisma ServiceOrder create input.
   * @param entity - ServiceOrder domain entity to convert
   * @returns Mapped Prisma ServiceOrder create input
   */
  static toPrismaCreate(entity: ServiceOrder): PrismaServiceOrderCreateInput {
    if (!entity) {
      throw new Error('ServiceOrder domain entity cannot be null or undefined')
    }
    return {
      status: entity.status,
      requestDate: entity.requestDate,
      deliveryDate: entity.deliveryDate,
      cancellationReason: entity.cancellationReason,
      notes: entity.notes,
      clientId: entity.clientId,
      vehicleId: entity.vehicleId,
    }
  }

  /**
   * Maps a ServiceOrder domain entity to a Prisma ServiceOrder update input.
   * @param entity - ServiceOrder domain entity to convert
   * @returns Mapped Prisma ServiceOrder update input
   */
  static toPrismaUpdate(entity: ServiceOrder): PrismaServiceOrderUpdateInput {
    if (!entity) {
      throw new Error('ServiceOrder domain entity cannot be null or undefined')
    }
    return {
      status: entity.status,
      deliveryDate: entity.deliveryDate,
      cancellationReason: entity.cancellationReason,
      notes: entity.notes,
      updatedAt: entity.updatedAt,
    }
  }
}

validateBasePrismaMapper<
  ServiceOrder,
  PrismaServiceOrder,
  PrismaServiceOrderCreateInput,
  PrismaServiceOrderUpdateInput
>(ServiceOrderMapper, 'ServiceOrderMapper')

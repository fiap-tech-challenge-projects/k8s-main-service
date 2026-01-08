import { VehicleEvaluation as PrismaVehicleEvaluation, Prisma } from '@prisma/client'

import { VehicleEvaluation } from '@domain/vehicle-evaluations'
import { validateBasePrismaMapper } from '@shared/bases'

type PrismaVehicleEvaluationCreateInput = Prisma.VehicleEvaluationUncheckedCreateInput
type PrismaVehicleEvaluationUpdateInput = Prisma.VehicleEvaluationUncheckedUpdateInput

/**
 * Mapper for converting between Prisma VehicleEvaluation models and VehicleEvaluation domain entities
 */
export class VehicleEvaluationMapper {
  /**
   * Converts a Prisma VehicleEvaluation model to a VehicleEvaluation domain entity
   * @param prismaVehicleEvaluation - The Prisma VehicleEvaluation model from the database
   * @returns VehicleEvaluation domain entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  static toDomain(prismaVehicleEvaluation: PrismaVehicleEvaluation): VehicleEvaluation {
    if (!prismaVehicleEvaluation) {
      throw new Error('Prisma VehicleEvaluation model cannot be null or undefined')
    }

    return new VehicleEvaluation(
      prismaVehicleEvaluation.id,
      prismaVehicleEvaluation.serviceOrderId,
      prismaVehicleEvaluation.vehicleId,
      prismaVehicleEvaluation.details as Record<string, unknown>,
      prismaVehicleEvaluation.evaluationDate,
      prismaVehicleEvaluation.mechanicNotes ?? undefined,
      prismaVehicleEvaluation.createdAt,
      prismaVehicleEvaluation.createdAt, // VehicleEvaluation doesn't have updatedAt, using createdAt
    )
  }

  /**
   * Converts multiple Prisma VehicleEvaluation models to VehicleEvaluation domain entities
   * @param prismaVehicleEvaluations - Array of Prisma VehicleEvaluation models
   * @returns Array of VehicleEvaluation domain entities
   */
  static toDomainMany(prismaVehicleEvaluations: PrismaVehicleEvaluation[]): VehicleEvaluation[] {
    if (!Array.isArray(prismaVehicleEvaluations)) {
      return []
    }

    return prismaVehicleEvaluations
      .filter((vehicleEvaluation) => vehicleEvaluation !== null && vehicleEvaluation !== undefined)
      .map((vehicleEvaluation) => this.toDomain(vehicleEvaluation))
  }

  /**
   * Converts a VehicleEvaluation domain entity to Prisma create data
   * @param vehicleEvaluation - The VehicleEvaluation domain entity to convert
   * @returns Prisma create input data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaCreate(vehicleEvaluation: VehicleEvaluation): PrismaVehicleEvaluationCreateInput {
    if (!vehicleEvaluation) {
      throw new Error('VehicleEvaluation domain entity cannot be null or undefined')
    }

    return {
      serviceOrderId: vehicleEvaluation.serviceOrderId,
      vehicleId: vehicleEvaluation.vehicleId,
      details: vehicleEvaluation.details as Prisma.InputJsonValue,
      evaluationDate: vehicleEvaluation.evaluationDate,
      mechanicNotes: vehicleEvaluation.mechanicNotes ?? null,
    }
  }

  /**
   * Converts a VehicleEvaluation domain entity to Prisma update data
   * @param vehicleEvaluation - The VehicleEvaluation domain entity to convert
   * @returns Prisma update input data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaUpdate(vehicleEvaluation: VehicleEvaluation): PrismaVehicleEvaluationUpdateInput {
    if (!vehicleEvaluation) {
      throw new Error('VehicleEvaluation domain entity cannot be null or undefined')
    }

    return {
      serviceOrderId: vehicleEvaluation.serviceOrderId,
      vehicleId: vehicleEvaluation.vehicleId,
      details: vehicleEvaluation.details as Prisma.InputJsonValue,
      evaluationDate: vehicleEvaluation.evaluationDate,
      mechanicNotes: vehicleEvaluation.mechanicNotes ?? null,
    }
  }
}

validateBasePrismaMapper<
  VehicleEvaluation,
  PrismaVehicleEvaluation,
  PrismaVehicleEvaluationCreateInput,
  PrismaVehicleEvaluationUpdateInput
>(VehicleEvaluationMapper, 'VehicleEvaluationMapper')

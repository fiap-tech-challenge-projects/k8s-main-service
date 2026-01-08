import { Injectable } from '@nestjs/common'
import { VehicleEvaluation as PrismaVehicleEvaluation } from '@prisma/client'

import {
  VehicleEvaluation,
  VehicleEvaluationRepositoryInterface,
} from '@domain/vehicle-evaluations'
import { BasePrismaRepository } from '@infra/database/common'
import { VehicleEvaluationMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'

/**
 * Prisma implementation of the VehicleEvaluation repository
 */
@Injectable()
export class PrismaVehicleEvaluationRepository
  extends BasePrismaRepository<VehicleEvaluation, PrismaVehicleEvaluation>
  implements VehicleEvaluationRepositoryInterface
{
  /**
   * Constructor for PrismaVehicleEvaluationRepository
   * @param prisma - The Prisma service dependency
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaVehicleEvaluationRepository.name)
  }

  protected get modelName(): string {
    return 'vehicleEvaluation'
  }

  protected get mapper(): (prismaModel: PrismaVehicleEvaluation) => VehicleEvaluation {
    return VehicleEvaluationMapper.toDomain
  }

  protected get createMapper(): (entity: VehicleEvaluation) => Record<string, unknown> {
    return VehicleEvaluationMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: VehicleEvaluation) => Record<string, unknown> {
    return VehicleEvaluationMapper.toPrismaUpdate
  }

  /**
   * Find vehicle evaluation by service order ID
   * @param serviceOrderId - The service order ID
   * @returns Promise resolving to the vehicle evaluation or null if not found
   */
  async findByServiceOrderId(serviceOrderId: string): Promise<VehicleEvaluation | null> {
    try {
      return this.findByUniqueField('serviceOrderId', serviceOrderId)
    } catch (error) {
      this.logger.error(
        `Error finding vehicle evaluation by service order ID ${serviceOrderId}:`,
        error,
      )
      throw error
    }
  }

  /**
   * Find vehicle evaluations by vehicle ID
   * @param vehicleId - The vehicle ID
   * @returns Promise resolving to an array of vehicle evaluations
   */
  async findByVehicleId(vehicleId: string): Promise<VehicleEvaluation[]> {
    try {
      const result = await this.findPaginated({ vehicleId })
      return result.data
    } catch (error) {
      this.logger.error(`Error finding vehicle evaluations by vehicle ID ${vehicleId}:`, error)
      throw error
    }
  }
}

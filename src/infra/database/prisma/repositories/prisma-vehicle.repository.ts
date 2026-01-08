import { Injectable } from '@nestjs/common'
import { Vehicle as PrismaVehicle } from '@prisma/client'

import { Vehicle } from '@domain/vehicles/entities'
import { IVehicleRepository } from '@domain/vehicles/interfaces'
import { LicensePlate, Vin } from '@domain/vehicles/value-objects'
import { BasePrismaRepository } from '@infra/database/common'
import { VehicleMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PaginatedResult } from '@shared'

/**
 * Prisma implementation of the Vehicle repository
 */
@Injectable()
export class PrismaVehicleRepository
  extends BasePrismaRepository<Vehicle, PrismaVehicle>
  implements IVehicleRepository
{
  /**
   * Constructor for PrismaVehicleRepository
   * @param prisma - The Prisma service dependency
   */
  constructor(prisma: PrismaService) {
    super(prisma, PrismaVehicleRepository.name)
  }

  protected get modelName(): string {
    return 'vehicle'
  }

  protected get mapper(): (prismaModel: PrismaVehicle) => Vehicle {
    return VehicleMapper.toDomain
  }

  protected get createMapper(): (entity: Vehicle) => Record<string, unknown> {
    return VehicleMapper.toPrismaCreate
  }

  protected get updateMapper(): (entity: Vehicle) => Record<string, unknown> {
    return VehicleMapper.toPrismaUpdate
  }

  /**
   * Find vehicle by license plate
   * @param licensePlate - Vehicle's license plate
   * @returns Promise resolving to the vehicle or null if not found
   */
  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    try {
      const cleanLicensePlate = LicensePlate.create(licensePlate).clean
      return this.findByUniqueField('licensePlate', cleanLicensePlate)
    } catch (error) {
      this.logger.error(`Error finding vehicle by license plate ${licensePlate}:`, error)
      throw error
    }
  }

  /**
   * Find vehicle by VIN
   * @param vin - Vehicle Identification Number
   * @returns Promise resolving to the vehicle or null if not found
   */
  async findByVin(vin: string): Promise<Vehicle | null> {
    try {
      const cleanVin = Vin.create(vin).clean
      const model = this.prisma[this.modelName] as {
        findFirst: (params: { where: Record<string, string> }) => Promise<PrismaVehicle | null>
      }

      const data = await model.findFirst({ where: { vin: cleanVin } })

      if (!data) {
        return null
      }

      return this.mapper(data)
    } catch (error) {
      this.logger.error(`Error finding vehicle by VIN ${vin}:`, error)
      throw error
    }
  }

  /**
   * Find vehicles by client ID with pagination
   * @param clientId - Client's unique identifier
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByClientId(
    clientId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Vehicle>> {
    return this.findPaginated({ clientId }, page, limit, { createdAt: 'desc' })
  }

  /**
   * Check if license plate exists
   * @param licensePlate - License plate to check
   * @returns Promise resolving to true if exists, false otherwise
   */
  async licensePlateExists(licensePlate: string): Promise<boolean> {
    try {
      const cleanLicensePlate = LicensePlate.create(licensePlate).clean
      return this.uniqueFieldExists('licensePlate', cleanLicensePlate)
    } catch (error) {
      this.logger.error(`Error checking license plate existence ${licensePlate}:`, error)
      throw error
    }
  }

  /**
   * Check if VIN exists
   * @param vin - VIN to check
   * @returns Promise resolving to true if exists, false otherwise
   */
  async vinExists(vin: string): Promise<boolean> {
    try {
      const cleanVin = Vin.create(vin).clean
      const model = this.prisma[this.modelName] as {
        count: (params: { where: Record<string, string> }) => Promise<number>
      }

      const count = await model.count({ where: { vin: cleanVin } })
      return count > 0
    } catch (error) {
      this.logger.error(`Error checking VIN existence ${vin}:`, error)
      throw error
    }
  }

  /**
   * Find vehicles by make and model with pagination
   * @param make - Vehicle make/brand
   * @param model - Vehicle model
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  async findByMakeAndModel(
    make: string,
    model: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Vehicle>> {
    return this.findPaginated(
      {
        make: { equals: make, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
      },
      page,
      limit,
      { createdAt: 'desc' },
    )
  }

  /**
   * Check if license plate exists for another vehicle (excluding the given vehicle ID)
   * @param licensePlate - License plate to check
   * @param excludeVehicleId - Vehicle ID to exclude from the search
   * @returns Promise resolving to true if exists for another vehicle, false otherwise
   */
  async licensePlateExistsForOtherVehicle(
    licensePlate: string,
    excludeVehicleId: string,
  ): Promise<boolean> {
    try {
      const cleanLicensePlate = LicensePlate.create(licensePlate).clean
      const model = this.prisma[this.modelName] as {
        count: (params: { where: Record<string, unknown> }) => Promise<number>
      }

      const count = await model.count({
        where: {
          licensePlate: cleanLicensePlate,
          id: { not: excludeVehicleId },
        },
      })
      return count > 0
    } catch (error) {
      this.logger.error(
        `Error checking license plate existence for other vehicles ${licensePlate}:`,
        error,
      )
      throw error
    }
  }

  /**
   * Check if VIN exists for another vehicle (excluding the given vehicle ID)
   * @param vin - VIN to check
   * @param excludeVehicleId - Vehicle ID to exclude from the search
   * @returns Promise resolving to true if exists for another vehicle, false otherwise
   */
  async vinExistsForOtherVehicle(vin: string, excludeVehicleId: string): Promise<boolean> {
    try {
      const cleanVin = Vin.create(vin).clean
      const model = this.prisma[this.modelName] as {
        count: (params: { where: Record<string, unknown> }) => Promise<number>
      }

      const count = await model.count({
        where: {
          vin: cleanVin,
          id: { not: excludeVehicleId },
        },
      })
      return count > 0
    } catch (error) {
      this.logger.error(`Error checking VIN existence for other vehicles ${vin}:`, error)
      throw error
    }
  }
}

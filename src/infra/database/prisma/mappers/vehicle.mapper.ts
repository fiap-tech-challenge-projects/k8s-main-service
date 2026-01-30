import { Vehicle as PrismaVehicle, Prisma } from '@prisma/client'

import { Vehicle } from '@domain/vehicles/entities'
import { LicensePlate, Vin } from '@domain/vehicles/value-objects'
import { validateBasePrismaMapper } from '@shared/bases'

type PrismaVehicleCreateInput = Prisma.VehicleUncheckedCreateInput
type PrismaVehicleUpdateInput = Prisma.VehicleUncheckedUpdateInput

/**
 * Mapper for converting between Prisma Vehicle models and Vehicle domain entities
 */
export class VehicleMapper {
  /**
   * Converts a Prisma Vehicle model to a Vehicle domain entity
   * @param prismaVehicle - The Prisma Vehicle model from the database
   * @returns Vehicle domain entity
   * @throws {Error} If the Prisma model is null or undefined
   */
  static toDomain(prismaVehicle: PrismaVehicle): Vehicle {
    if (!prismaVehicle) {
      throw new Error('Prisma Vehicle model cannot be null or undefined')
    }

    return new Vehicle(
      prismaVehicle.id,
      LicensePlate.create(prismaVehicle.licensePlate),
      prismaVehicle.make,
      prismaVehicle.model,
      prismaVehicle.year,
      prismaVehicle.clientId,
      prismaVehicle.vin ? Vin.create(prismaVehicle.vin) : undefined,
      prismaVehicle.color ?? undefined,
      prismaVehicle.createdAt,
      prismaVehicle.updatedAt,
    )
  }

  /**
   * Converts multiple Prisma Vehicle models to Vehicle domain entities
   * @param prismaVehicles - Array of Prisma Vehicle models
   * @returns Array of Vehicle domain entities
   */
  static toDomainMany(prismaVehicles: PrismaVehicle[]): Vehicle[] {
    if (!Array.isArray(prismaVehicles)) {
      return []
    }

    return prismaVehicles
      .filter((vehicle) => vehicle !== null && vehicle !== undefined)
      .map((vehicle) => this.toDomain(vehicle))
  }

  /**
   * Converts a Vehicle domain entity to Prisma create data
   * @param vehicle - The Vehicle domain entity to convert
   * @returns Prisma create input data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaCreate(vehicle: Vehicle): PrismaVehicleCreateInput {
    if (!vehicle) {
      throw new Error('Vehicle domain entity cannot be null or undefined')
    }

    return {
      licensePlate: vehicle.licensePlate.clean,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin?.clean ?? null,
      color: vehicle.color ?? null,
      clientId: vehicle.clientId,
    }
  }

  /**
   * Converts a Vehicle domain entity to Prisma update data
   * @param vehicle - The Vehicle domain entity to convert
   * @returns Prisma update input data
   * @throws {Error} If the domain entity is null or undefined
   */
  static toPrismaUpdate(vehicle: Vehicle): PrismaVehicleUpdateInput {
    if (!vehicle) {
      throw new Error('Vehicle domain entity cannot be null or undefined')
    }

    return {
      licensePlate: vehicle.licensePlate.clean,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin?.clean ?? null,
      color: vehicle.color ?? null,
      clientId: vehicle.clientId,
      updatedAt: new Date(),
    }
  }
}

// Validate that this mapper implements the required contract
validateBasePrismaMapper<
  Vehicle,
  PrismaVehicle,
  PrismaVehicleCreateInput,
  PrismaVehicleUpdateInput
>(VehicleMapper, 'VehicleMapper')

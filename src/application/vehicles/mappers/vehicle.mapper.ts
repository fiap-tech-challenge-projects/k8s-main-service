import { CreateVehicleDto, UpdateVehicleDto, VehicleResponseDto } from '@application/vehicles/dto'
import { Vehicle } from '@domain/vehicles/entities'
import { validateBaseMapper } from '@shared'

/**
 * Mapper for converting between Vehicle entities and DTOs
 */
export class VehicleMapper {
  /**
   * Convert Vehicle entity to VehicleResponseDto
   * @param vehicle - Vehicle entity to convert
   * @returns VehicleResponseDto
   */
  static toResponseDto(vehicle: Vehicle): VehicleResponseDto {
    return {
      id: vehicle.id,
      licensePlate: vehicle.getFormattedLicensePlate(),
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.getCleanVin(),
      color: vehicle.color,
      clientId: vehicle.clientId,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }
  }

  /**
   * Convert array of Vehicle entities to VehicleResponseDto array
   * @param vehicles - Array of Vehicle entities to convert
   * @returns Array of VehicleResponseDto
   */
  static toResponseDtoArray(vehicles: Vehicle[]): VehicleResponseDto[] {
    return vehicles.map((vehicle) => this.toResponseDto(vehicle))
  }

  /**
   * Convert CreateVehicleDto to Vehicle entity
   * @param createVehicleDto - DTO with vehicle creation data
   * @returns Vehicle entity
   */
  static fromCreateDto(createVehicleDto: CreateVehicleDto): Vehicle {
    return Vehicle.create(
      createVehicleDto.licensePlate,
      createVehicleDto.make,
      createVehicleDto.model,
      createVehicleDto.year,
      createVehicleDto.clientId,
      createVehicleDto.vin,
      createVehicleDto.color,
    )
  }

  /**
   * Convert UpdateVehicleDto to updated Vehicle entity
   * @param updateVehicleDto - DTO with vehicle update data
   * @param existingVehicle - Existing Vehicle entity to update
   * @returns Updated Vehicle entity
   */
  static fromUpdateDto(updateVehicleDto: UpdateVehicleDto, existingVehicle: Vehicle): Vehicle {
    if (
      updateVehicleDto.licensePlate !== undefined &&
      updateVehicleDto.licensePlate !== existingVehicle.getFormattedLicensePlate()
    ) {
      existingVehicle.updateLicensePlate(updateVehicleDto.licensePlate)
    }

    if (updateVehicleDto.make !== undefined && updateVehicleDto.make !== existingVehicle.make) {
      existingVehicle.updateMake(updateVehicleDto.make)
    }

    if (updateVehicleDto.model !== undefined && updateVehicleDto.model !== existingVehicle.model) {
      existingVehicle.updateModel(updateVehicleDto.model)
    }

    if (updateVehicleDto.year !== undefined && updateVehicleDto.year !== existingVehicle.year) {
      existingVehicle.updateYear(updateVehicleDto.year)
    }

    if (
      updateVehicleDto.vin !== undefined &&
      updateVehicleDto.vin !== existingVehicle.getCleanVin()
    ) {
      existingVehicle.updateVin(updateVehicleDto.vin)
    }

    if (updateVehicleDto.color !== undefined && updateVehicleDto.color !== existingVehicle.color) {
      existingVehicle.updateColor(updateVehicleDto.color)
    }

    return existingVehicle
  }
}

// Validate that this mapper implements the required contract
validateBaseMapper<Vehicle, VehicleResponseDto, CreateVehicleDto, UpdateVehicleDto>(
  VehicleMapper,
  'VehicleMapper',
)

import { Vehicle } from '@domain/vehicles/entities'
import { IBaseRepository, PaginatedResult } from '@shared'

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY')

export interface IVehicleRepository extends IBaseRepository<Vehicle> {
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>

  findByVin(vin: string): Promise<Vehicle | null>

  findByClientId(clientId: string, page?: number, limit?: number): Promise<PaginatedResult<Vehicle>>

  licensePlateExists(licensePlate: string): Promise<boolean>

  vinExists(vin: string): Promise<boolean>

  licensePlateExistsForOtherVehicle(
    licensePlate: string,
    excludeVehicleId: string,
  ): Promise<boolean>

  vinExistsForOtherVehicle(vin: string, excludeVehicleId: string): Promise<boolean>

  findByMakeAndModel(
    make: string,
    model: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Vehicle>>
}

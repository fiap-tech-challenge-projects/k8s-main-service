import {
  LicensePlateAlreadyExistsException,
  VinAlreadyExistsException,
} from '@domain/vehicles/exceptions'

/**
 * Type for license plate validation function that checks if license plate exists for another vehicle
 */
export type LicensePlateExistsForOtherVehicleFunction = (
  licensePlate: string,
  excludeVehicleId: string,
) => Promise<boolean>

/**
 * Type for VIN validation function that checks if VIN exists for another vehicle
 */
export type VinExistsForOtherVehicleFunction = (
  vin: string,
  excludeVehicleId: string,
) => Promise<boolean>

/**
 * Validator for vehicle update business rules
 */
export class VehicleUpdateValidator {
  /**
   * Validates if a license plate is available for update (excluding current vehicle)
   * @param licensePlate - The license plate to validate
   * @param currentVehicleId - The ID of the vehicle being updated
   * @param licensePlateExistsForOtherVehicle - Function to check if license plate exists for another vehicle
   * @throws LicensePlateAlreadyExistsException if license plate already exists for another vehicle
   */
  public static async validateLicensePlateAvailabilityForUpdate(
    licensePlate: string,
    currentVehicleId: string,
    licensePlateExistsForOtherVehicle: LicensePlateExistsForOtherVehicleFunction,
  ): Promise<void> {
    const exists = await licensePlateExistsForOtherVehicle(licensePlate, currentVehicleId)
    if (exists) {
      throw new LicensePlateAlreadyExistsException(licensePlate)
    }
  }

  /**
   * Validates if a VIN is available for update (excluding current vehicle)
   * @param vin - The VIN to validate
   * @param currentVehicleId - The ID of the vehicle being updated
   * @param vinExistsForOtherVehicle - Function to check if VIN exists for another vehicle
   * @throws VinAlreadyExistsException if VIN already exists for another vehicle
   */
  public static async validateVinAvailabilityForUpdate(
    vin: string,
    currentVehicleId: string,
    vinExistsForOtherVehicle: VinExistsForOtherVehicleFunction,
  ): Promise<void> {
    const exists = await vinExistsForOtherVehicle(vin, currentVehicleId)
    if (exists) {
      throw new VinAlreadyExistsException(vin)
    }
  }
}

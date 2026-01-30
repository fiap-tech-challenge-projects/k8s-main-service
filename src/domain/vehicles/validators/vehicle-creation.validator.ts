import {
  LicensePlateAlreadyExistsException,
  VinAlreadyExistsException,
} from '@domain/vehicles/exceptions'

/**
 * Type for license plate validation function
 */
export type LicensePlateExistsFunction = (licensePlate: string) => Promise<boolean>

/**
 * Type for VIN validation function
 */
export type VinExistsFunction = (vin: string) => Promise<boolean>

/**
 * Validator for vehicle creation business rules
 */
export class VehicleCreationValidator {
  /**
   * Validates if a license plate is available for registration
   * @param licensePlate - The license plate to validate
   * @param licensePlateExists - Function to check if license plate exists
   * @throws LicensePlateAlreadyExistsException if license plate already exists
   */
  public static async validateLicensePlateAvailability(
    licensePlate: string,
    licensePlateExists: LicensePlateExistsFunction,
  ): Promise<void> {
    const exists = await licensePlateExists(licensePlate)
    if (exists) {
      throw new LicensePlateAlreadyExistsException(licensePlate)
    }
  }

  /**
   * Validates if a VIN is available for registration
   * @param vin - The VIN to validate
   * @param vinExists - Function to check if VIN exists
   * @throws VinAlreadyExistsException if VIN already exists
   */
  public static async validateVinAvailability(
    vin: string,
    vinExists: VinExistsFunction,
  ): Promise<void> {
    const exists = await vinExists(vin)
    if (exists) {
      throw new VinAlreadyExistsException(vin)
    }
  }

  /**
   * Validates vehicle creation data for uniqueness constraints
   * @param licensePlate - The license plate to validate
   * @param vin - The VIN to validate (optional)
   * @param licensePlateExists - Function to check if license plate exists
   * @param vinExists - Function to check if VIN exists
   */
  public static async validateVehicleUniqueness(
    licensePlate: string,
    vin: string | undefined,
    licensePlateExists: LicensePlateExistsFunction,
    vinExists: VinExistsFunction,
  ): Promise<void> {
    await this.validateLicensePlateAvailability(licensePlate, licensePlateExists)

    if (vin) {
      await this.validateVinAvailability(vin, vinExists)
    }
  }
}

import { EntityNotFoundException } from '@shared'

/**
 * Exception thrown when a vehicle is not found
 */
export class VehicleNotFoundException extends EntityNotFoundException {
  /**
   * Constructor for vehicle not found exception
   * @param vehicleId - ID of the vehicle that was not found
   */
  constructor(vehicleId: string) {
    super('Vehicle', vehicleId)
    this.name = 'VehicleNotFoundException'
  }

  /**
   * Creates a vehicle not found exception for license plate search
   * @param licensePlate - License plate that was not found
   * @returns VehicleNotFoundException with appropriate message
   */
  static forLicensePlate(licensePlate: string): VehicleNotFoundException {
    const exception = new VehicleNotFoundException(licensePlate)
    exception.message = `Vehicle with license plate '${licensePlate}' not found`
    return exception
  }
}

import { AlreadyExistsException } from '@shared/exceptions'

/**
 * Exception thrown when a license plate already exists for another vehicle
 */
export class LicensePlateAlreadyExistsException extends AlreadyExistsException {
  /**
   * Constructor for license plate already exists exception
   * @param licensePlate - License plate that already exists
   */
  constructor(licensePlate: string) {
    super('vehicle', 'license plate', licensePlate)
    this.name = 'LicensePlateAlreadyExistsException'
  }
}

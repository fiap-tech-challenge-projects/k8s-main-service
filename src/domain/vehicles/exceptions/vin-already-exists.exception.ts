import { AlreadyExistsException } from '@shared/exceptions'

/**
 * Exception thrown when a VIN already exists for another vehicle
 */
export class VinAlreadyExistsException extends AlreadyExistsException {
  /**
   * Constructor for VIN already exists exception
   * @param vin - VIN that already exists
   */
  constructor(vin: string) {
    super('vehicle', 'VIN', vin)
    this.name = 'VinAlreadyExistsException'
  }
}

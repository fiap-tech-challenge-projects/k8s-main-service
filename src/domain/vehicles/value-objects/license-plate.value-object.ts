import { LicensePlateValidator } from '@domain/vehicles/validators'
import { BaseValueObject, InvalidValueException } from '@shared'

/**
 * License plate value object for Brazilian vehicle license plates
 */
export class LicensePlate extends BaseValueObject<string> {
  /**
   * Constructor for LicensePlate value object
   * @param value - The license plate string value
   */
  constructor(value: string) {
    super(value)
  }

  protected validate(): void {
    if (!LicensePlateValidator.isValid(this._value)) {
      throw new InvalidValueException(
        this._value,
        'License plate must be a valid Brazilian license plate format',
      )
    }
  }

  /**
   * Get the formatted license plate value
   * @returns Formatted license plate string (ABC-1234)
   */
  public get formatted(): string {
    return LicensePlateValidator.format(this._value)
  }

  /**
   * Get the clean license plate value
   * @returns Clean license plate string with only letters and numbers
   */
  public get clean(): string {
    return LicensePlateValidator.clean(this._value)
  }

  /**
   * Create a LicensePlate value object from a string
   * @param value - The license plate string value
   * @returns LicensePlate value object
   */
  public static create(value: string): LicensePlate {
    return new LicensePlate(value)
  }
}

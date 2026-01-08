import { VinValidator } from '@domain/vehicles/validators'
import { BaseValueObject, InvalidValueException } from '@shared'

/**
 * VIN (Vehicle Identification Number) value object
 */
export class Vin extends BaseValueObject<string> {
  /**
   * Constructor for VIN value object
   * @param value - The VIN string value
   */
  constructor(value: string) {
    super(value)
  }

  protected validate(): void {
    if (!VinValidator.isValid(this._value)) {
      throw new InvalidValueException(
        this._value,
        'VIN must be a valid 17-character vehicle identification number',
      )
    }
  }

  /**
   * Get the formatted VIN value
   * @returns Formatted VIN string (XXXX-XXXXX-XXXXX-XXX)
   */
  public get formatted(): string {
    return VinValidator.format(this._value)
  }

  /**
   * Get the clean VIN value
   * @returns Clean VIN string with only letters and numbers
   */
  public get clean(): string {
    return VinValidator.clean(this._value)
  }

  /**
   * Create a VIN value object from a string
   * @param value - The VIN string value
   * @returns VIN value object
   */
  public static create(value: string): Vin {
    return new Vin(value)
  }
}

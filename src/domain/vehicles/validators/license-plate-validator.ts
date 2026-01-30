import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

/**
 * Utility class for license plate validation
 */
export class LicensePlateValidator {
  /**
   * Validate if a license plate string is valid according to Brazilian format
   * @param licensePlate - The license plate string to validate
   * @returns True if license plate is valid, false otherwise
   */
  public static isValid(licensePlate: string): boolean {
    if (!licensePlate || typeof licensePlate !== 'string') {
      return false
    }

    const cleanPlate = this.clean(licensePlate)

    if (cleanPlate.length !== 7) {
      return false
    }

    const pattern = /^[A-Z]{3}[0-9]{4}$/
    return pattern.test(cleanPlate)
  }

  /**
   * Format a license plate string to the standard format (ABC-1234)
   * @param licensePlate - The license plate string to format
   * @returns Formatted license plate string
   */
  public static format(licensePlate: string): string {
    const clean = this.clean(licensePlate)
    return `${clean.slice(0, 3)}-${clean.slice(3)}`
  }

  /**
   * Clean a license plate string by removing non-alphanumeric characters and converting to uppercase
   * @param licensePlate - The license plate string to clean
   * @returns Clean license plate string with only letters and numbers
   */
  public static clean(licensePlate: string): string {
    return licensePlate.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  }
}

/**
 * License plate validation decorator function
 * Usage: @IsLicensePlate() or @IsLicensePlate({ message: 'Custom message' })
 * @param validationOptions - Validation options for the decorator
 * @returns Property decorator function
 */
export function isLicensePlate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isLicensePlate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false
          }
          return LicensePlateValidator.isValid(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Brazilian license plate`
        },
      },
    })
  }
}

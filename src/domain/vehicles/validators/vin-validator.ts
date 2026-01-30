import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

/**
 * Utility class for VIN validation
 */
export class VinValidator {
  /**
   * Validate if a VIN string is valid according to standard format
   * @param vin - The VIN string to validate
   * @returns True if VIN is valid, false otherwise
   */
  public static isValid(vin: string): boolean {
    if (!vin || typeof vin !== 'string') {
      return false
    }

    const cleanVin = this.clean(vin)

    if (cleanVin.length !== 17) {
      return false
    }

    const pattern = /^[A-HJ-NPR-Z0-9]{17}$/
    return pattern.test(cleanVin)
  }

  /**
   * Format a VIN string to the standard format (XXXX-XXXXX-XXXXX-XXX)
   * @param vin - The VIN string to format
   * @returns Formatted VIN string
   */
  public static format(vin: string): string {
    const clean = this.clean(vin)
    return `${clean.slice(0, 4)}-${clean.slice(4, 9)}-${clean.slice(9, 14)}-${clean.slice(14)}`
  }

  /**
   * Clean a VIN string by removing non-alphanumeric characters and converting to uppercase
   * @param vin - The VIN string to clean
   * @returns Clean VIN string with only valid characters
   */
  public static clean(vin: string): string {
    return vin.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  }
}

/**
 * VIN validation decorator function
 * Usage: @IsVin() or @IsVin({ message: 'Custom message' })
 * @param validationOptions - Validation options for the decorator
 * @returns Property decorator function
 */
export function isVin(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isVin',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false
          }
          return VinValidator.isValid(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid 17-character vehicle identification number`
        },
      },
    })
  }
}

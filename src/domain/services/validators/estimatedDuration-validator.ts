import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

/**
 * Utility class for estimated duration validation
 */
export class EstimatedDurationValidator {
  /**
   * Validates if the given value is a valid estimated duration.
   * A valid estimated duration is a non-negative number (representing hours) or a string in "HH:MM:SS" format.
   * @param {string | number} value - The value to validate as an estimated duration.
   * @returns {boolean} - Returns true if the value is a valid estimated duration, otherwise false.
   */
  static isValid(value: string | number): boolean {
    if (value === null || value === undefined) return false

    if (typeof value === 'string') {
      if (/^\d{1,2}:\d{2}:\d{2}$/.test(value)) {
        const floatVal = this.formatTimeToFloat(value)
        return floatVal >= 0
      }

      const number = Number(value)
      return Number.isFinite(number) && number >= 0
    }

    return Number.isFinite(value) && value >= 0
  }

  /**
   * Converts a time string in "HH:MM:SS" format to a float representing hours.
   * @param {string} time - The time in "HH:MM:SS" format to convert to a float.
   * @returns {number} - Returns the estimated duration in hours as a float.
   */
  static formatTimeToFloat(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number)

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      throw new Error(`Invalid time format: "${time}". Expected format: HH:MM:SS`)
    }

    const totalHours = hours + minutes / 60 + seconds / 3600
    return parseFloat(totalHours.toFixed(4))
  }

  /**
   * Converts a float representing hours to a time string in "HH:MM:SS" format.
   * @param {number} hours - The duration in hours as a float.
   * @returns {string} - Returns the time in "HH:MM:SS" format.
   */
  static formatFloatToTime(hours: number): string {
    const totalSeconds = Math.round(hours * 3600)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
}

/**
 * Custom decorator to validate estimated duration in class-validator.
 * @param { validationOptions } validationOptions - Optional validation options.
 * @returns {Function} - Property decorator function.
 */
export function isValidEstimatedDuration(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidEstimatedDuration',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string' && typeof value !== 'number') {
            return false
          }
          return EstimatedDurationValidator.isValid(value as string | number)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid non-negative number (hours) or string in HH:MM:SS format representing estimated duration.`
        },
      },
    })
  }
}

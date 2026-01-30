import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

/**
 * Service class for validating and formatting price values.
 * Supports both string and number formats.
 */
export class PriceValidator {
  /**
   * Validates if the given value is a valid price format.
   * Accepts both string and number formats.
   * @param value - The price value as a string or number
   * @returns True if valid, false otherwise
   */
  static isValid(value: number | string): boolean {
    if (typeof value === 'string') {
      const numberValue = this.formatToNumber(value)
      return Number.isFinite(numberValue) && numberValue >= 0
    }
    return Number.isFinite(value) && value >= 0
  }

  /**
   * Converts a price string to a number in cents for database storage.
   * Intelligently handles different input formats:
   * - "R$1000.00" -> 100000 (cents)
   * - "100000" -> 100000 (cents)
   * - "1000.00" -> 100000 (cents)
   * - "1000,00" -> 100000 (cents)
   * - "R$1.000,00" -> 100000 (cents)
   * - "R$1,000.00" -> 100000 (cents)
   * - "100" -> 100 (cents, treated as R$1,00)
   * @param value - The price value as a string or number
   * @returns The numeric representation of the price in cents, or NaN if invalid
   */
  static formatToNumber(value: string | number): number {
    if (typeof value === 'number') {
      if (value >= 0 && Number.isFinite(value)) {
        return value
      }
      return NaN
    }

    if (typeof value === 'string') {
      // Remove currency symbols and spaces
      const cleanValue = value.replace(/[R$\s]/g, '')

      // Handle Brazilian Real format with dots as thousands separator and comma as decimal
      // Examples: "1.234,56", "1.000,00"
      const brazilianFormatRegex = /^\d{1,3}(\.\d{3})+(,\d{1,2})?$/
      if (brazilianFormatRegex.test(cleanValue)) {
        const normalized = cleanValue.replace(/\./g, '').replace(',', '.')
        const parsed = Number(normalized)
        if (isNaN(parsed) || parsed < 0) {
          return NaN
        }
        // Reject unreasonably large numbers (more than 1 million reais)
        if (parsed > 1000000) {
          return NaN
        }
        return Math.round(parsed * 100) // Convert to cents
      }

      // Handle Brazilian Real format without thousands separator but with comma decimal
      // Examples: "1000,00", "123,45"
      const brazilianSimpleFormatRegex = /^\d+,\d{1,2}$/
      if (brazilianSimpleFormatRegex.test(cleanValue)) {
        const normalized = cleanValue.replace(',', '.')
        const parsed = Number(normalized)
        if (isNaN(parsed) || parsed < 0) {
          return NaN
        }
        // Reject unreasonably large numbers (more than 1 million reais)
        if (parsed > 1000000) {
          return NaN
        }
        return Math.round(parsed * 100) // Convert to cents
      }

      // Handle US/International format with comma as thousands separator and dot as decimal
      // Examples: "1,234.56", "1,000.00"
      const internationalFormatRegex = /^\d{1,3}(,\d{3})+(\.\d{1,2})?$/
      if (internationalFormatRegex.test(cleanValue)) {
        const normalized = cleanValue.replace(/,/g, '')
        const parsed = Number(normalized)
        if (isNaN(parsed) || parsed < 0) {
          return NaN
        }
        // Reject unreasonably large numbers (more than 1 million reais)
        if (parsed > 1000000) {
          return NaN
        }
        return Math.round(parsed * 100) // Convert to cents
      }

      // Handle plain integer format (e.g., "100000", "1000", "100")
      const integerFormatRegex = /^\d+$/
      if (integerFormatRegex.test(cleanValue)) {
        const parsed = Number(cleanValue)
        if (isNaN(parsed) || parsed < 0) {
          return NaN
        }

        // If it's a very large number (>= 100000), assume it's already in cents
        if (parsed >= 100000) {
          // Reject unreasonably large numbers (more than 100 million cents = 1 million reais)
          if (parsed > 100000000) {
            return NaN
          }
          return parsed
        }

        // For smaller numbers, assume they are already in cents
        // This handles cases like "100" -> 100 cents (R$1,00)
        return parsed
      }

      // Handle plain decimal format (e.g., "1234.56", "1000.00")
      const decimalFormatRegex = /^\d+(\.\d{1,2})?$/
      if (decimalFormatRegex.test(cleanValue)) {
        const parsed = Number(cleanValue)
        if (isNaN(parsed) || parsed < 0) {
          return NaN
        }
        // Reject unreasonably large numbers (more than 1 million reais)
        if (parsed > 1000000) {
          return NaN
        }
        return Math.round(parsed * 100) // Convert to cents
      }

      return NaN
    }

    return NaN
  }
}

/**
 * Custom decorator to validate if a property is a valid price format.
 * @param validationOptions - Optional validation options
 * @returns A property decorator function
 */
export function isValidPrice(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPrice',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false
          return PriceValidator.isValid(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid non-negative price format, e.g., "R$1000.00", "100000", "1000.00", "1000,00", "R$1.000,00", or "R$1,000.00".`
        },
      },
    })
  }
}

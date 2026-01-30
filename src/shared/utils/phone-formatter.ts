import { Logger } from '@nestjs/common'
import { parsePhoneNumberWithError, isValidPhoneNumber } from 'libphonenumber-js'

/**
 * Utility class for formatting phone numbers
 */
export class PhoneFormatter {
  private static readonly logger = new Logger(PhoneFormatter.name)

  /**
   * Formats a Brazilian phone number to international format
   * @param phone - The phone number to format (can be in various formats)
   * @returns Formatted phone number or undefined if invalid
   */
  static format(phone: string | null | undefined): string | undefined {
    if (!phone) {
      return undefined
    }

    try {
      const phoneNumber = parsePhoneNumberWithError(phone, 'BR')

      if (phoneNumber && isValidPhoneNumber(phoneNumber.number, 'BR')) {
        return phoneNumber.formatInternational().replace(/\s+/g, ' ')
      }

      const internationalPhone = parsePhoneNumberWithError(phone)
      if (internationalPhone && isValidPhoneNumber(internationalPhone.number)) {
        return internationalPhone.formatInternational().replace(/\s+/g, ' ')
      }

      return undefined
    } catch (error) {
      this.logger.error('Error formatting phone number:', error)
      return undefined
    }
  }

  /**
   * Formats a Brazilian phone number to national format
   * @param phone - The phone number to format
   * @returns Formatted phone number or null if invalid
   */
  static formatNational(phone: string | null | undefined): string | null {
    if (!phone) {
      return null
    }

    try {
      const phoneNumber = parsePhoneNumberWithError(phone, 'BR')

      if (phoneNumber && isValidPhoneNumber(phoneNumber.number, 'BR')) {
        return phoneNumber.formatNational()
      }

      return null
    } catch (error) {
      this.logger.error('Error formatting phone number to national format:', error)
      return null
    }
  }

  /**
   * Validates if a phone number is valid for Brazil
   * @param phone - The phone number to validate
   * @returns True if valid, false otherwise
   */
  static isValid(phone: string | null | undefined): boolean {
    if (!phone) {
      return false
    }

    try {
      const phoneNumber = parsePhoneNumberWithError(phone, 'BR')
      return phoneNumber ? isValidPhoneNumber(phoneNumber.number, 'BR') : false
    } catch (error) {
      this.logger.error('Error validating phone number:', error)
      return false
    }
  }
}

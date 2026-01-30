import { PhoneFormatter } from '@shared/utils'

describe('PhoneFormatter', () => {
  describe('format', () => {
    it('should format Brazilian mobile phone numbers correctly', () => {
      const testCases = [
        { input: '11999999999', expected: '+55 11 99999 9999' },
        { input: '11988887777', expected: '+55 11 98888 7777' },
        { input: '11977776666', expected: '+55 11 97777 6666' },
        { input: '11966665555', expected: '+55 11 96666 5555' },
      ]

      testCases.forEach(({ input, expected }) => {
        const result = PhoneFormatter.format(input)
        expect(result).toBe(expected)
      })
    })

    it('should format Brazilian landline phone numbers correctly', () => {
      const testCases = [
        { input: '1133334444', expected: '+55 11 3333 4444' },
        { input: '1122223333', expected: '+55 11 2222 3333' },
        { input: '1111112222', expected: '+55 1111112222' },
      ]

      testCases.forEach(({ input, expected }) => {
        const result = PhoneFormatter.format(input)
        expect(result).toBe(expected)
      })
    })

    it('should handle already formatted phone numbers', () => {
      const testCases = [
        { input: '+55 11 99999-9999', expected: '+55 11 99999 9999' },
        { input: '+55 11 3333-4444', expected: '+55 11 3333 4444' },
        { input: '+5511999999999', expected: '+55 11 99999 9999' },
      ]

      testCases.forEach(({ input, expected }) => {
        const result = PhoneFormatter.format(input)
        expect(result).toBe(expected)
      })
    })

    it('should return undefined for invalid phone numbers', () => {
      const invalidPhones = ['invalid-phone', '123', 'abc', '', '   ']

      invalidPhones.forEach((phone) => {
        const result = PhoneFormatter.format(phone)
        expect(result).toBeUndefined()
      })
    })

    it('should return undefined for null/undefined input', () => {
      expect(PhoneFormatter.format(null)).toBeUndefined()
      expect(PhoneFormatter.format(undefined)).toBeUndefined()
      expect(PhoneFormatter.format('')).toBeUndefined()
    })

    it('should handle different Brazilian area codes', () => {
      const testCases = [
        { input: '21999999999', expected: '+55 21 99999 9999' }, // Rio de Janeiro
        { input: '31999999999', expected: '+55 31 99999 9999' }, // Belo Horizonte
        { input: '41999999999', expected: '+55 41 99999 9999' }, // Curitiba
        { input: '51999999999', expected: '+55 51 99999 9999' }, // Porto Alegre
        { input: '61999999999', expected: '+55 61 99999 9999' }, // Brasília
      ]

      testCases.forEach(({ input, expected }) => {
        const result = PhoneFormatter.format(input)
        expect(result).toBe(expected)
      })
    })
  })

  describe('formatNational', () => {
    it('should format Brazilian phone numbers to national format', () => {
      const testCases = [
        { input: '11999999999', expected: '(11) 99999-9999' },
        { input: '1133334444', expected: '(11) 3333-4444' },
        { input: '21999999999', expected: '(21) 99999-9999' },
      ]

      testCases.forEach(({ input, expected }) => {
        const result = PhoneFormatter.formatNational(input)
        expect(result).toBe(expected)
      })
    })

    it('should return null for invalid phone numbers', () => {
      const invalidPhones = ['invalid-phone', '123', 'abc']

      invalidPhones.forEach((phone) => {
        const result = PhoneFormatter.formatNational(phone)
        expect(result).toBeNull()
      })
    })
  })

  describe('isValid', () => {
    it('should return true for valid Brazilian phone numbers', () => {
      const validPhones = [
        '11999999999',
        '1133334444',
        '21999999999',
        '+55 11 99999-9999',
        '+5511999999999',
      ]

      validPhones.forEach((phone) => {
        const result = PhoneFormatter.isValid(phone)
        expect(result).toBe(true)
      })
    })

    it('should return false for invalid phone numbers', () => {
      const invalidPhones = ['invalid-phone', '123', 'abc', '', null, undefined]

      invalidPhones.forEach((phone) => {
        const result = PhoneFormatter.isValid(phone)
        expect(result).toBe(false)
      })
    })
  })
})

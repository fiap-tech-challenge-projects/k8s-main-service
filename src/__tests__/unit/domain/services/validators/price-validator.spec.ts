import { PriceValidator } from '@shared/validators'

describe('PriceValidator', () => {
  describe('formatToNumber', () => {
    it('should correctly format valid price strings to cents', () => {
      const cases = [
        { input: 'R$1000.00', expected: 100000 },
        { input: '100000', expected: 100000 },
        { input: '1000.00', expected: 100000 },
        { input: '1000,00', expected: 100000 },
        { input: 'R$1.000,00', expected: 100000 },
        { input: 'R$1,000.00', expected: 100000 },
        { input: 'R$ 0,00', expected: 0 },
        { input: 'R$ 123,45', expected: 12345 },
        { input: 'R$ 0,99', expected: 99 },
        { input: 'R$ 999.999,99', expected: 99999999 },
        { input: '1234.56', expected: 123456 },
        { input: '1,234.56', expected: 123456 },
        { input: '150', expected: 150 }, // Now treated as cents
        { input: '1000', expected: 1000 }, // Now treated as cents
        { input: '100', expected: 100 }, // Now treated as cents
      ]

      cases.forEach(({ input, expected }) => {
        const result = PriceValidator.formatToNumber(input)
        expect(result).toBe(expected)
      })
    })

    it('should handle edge cases correctly', () => {
      const edgeCases = [
        { input: '0', expected: 0 },
        { input: '0.00', expected: 0 },
        { input: '0,00', expected: 0 },
        { input: 'R$0', expected: 0 },
        { input: 'R$ 0', expected: 0 },
        { input: '1000000', expected: 1000000 }, // Large number stays as cents
        { input: '9999', expected: 9999 }, // Small number treated as cents
      ]

      edgeCases.forEach(({ input, expected }) => {
        const result = PriceValidator.formatToNumber(input)
        expect(result).toBe(expected)
      })
    })

    it('should return NaN for invalid formats', () => {
      const invalidCases = [
        'invalid',
        'R$invalid',
        '1.234.567', // Too many dots
        '1,234,567', // Too many commas
        '1.234,567.89', // Mixed separators incorrectly
        '1,234.567,89', // Mixed separators incorrectly
        'abc123',
        '123abc',
        '',
        ' ',
        'R$',
        'R$ ',
      ]

      invalidCases.forEach((input) => {
        const result = PriceValidator.formatToNumber(input)
        expect(result).toBeNaN()
      })
    })
  })

  describe('isValid', () => {
    it('should validate correct price values', () => {
      const validValues = [
        'R$1000.00',
        '100000',
        '1000.00',
        '1000,00',
        'R$1.000,00',
        'R$1,000.00',
        '0',
        '123.45',
        '0.99',
        '1000',
        '100',
        0,
        123.45,
        0.99,
        1000,
      ]

      validValues.forEach((value) => {
        const result = PriceValidator.isValid(value)
        expect(result).toBe(true)
      })
    })

    it('should invalidate incorrect price values', () => {
      const invalidValues = [
        -123.45,
        NaN,
        Infinity,
        'abc',
        'invalid-price',
        '1.234.567',
        '1,234,567',
        null,
        undefined,
        '',
        ' ',
      ]

      invalidValues.forEach((value: string | number) => {
        const result = PriceValidator.isValid(value)
        expect(result).toBe(false)
      })
    })
  })
})

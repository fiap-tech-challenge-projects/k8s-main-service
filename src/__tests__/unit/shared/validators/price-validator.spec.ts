import { validate } from 'class-validator'

import { PriceValidator, isValidPrice } from '@shared/validators'

describe('PriceValidator', () => {
  describe('formatToNumber', () => {
    test('parses Brazilian format with thousands and comma decimal', () => {
      expect(PriceValidator.formatToNumber('R$1.234,56')).toBe(123456)
      expect(PriceValidator.formatToNumber('1.000,00')).toBe(100000)
    })

    test('parses simple brazilian decimal', () => {
      expect(PriceValidator.formatToNumber('123,45')).toBe(12345)
    })

    test('parses international format with comma thousands and dot decimal', () => {
      expect(PriceValidator.formatToNumber('1,234.56')).toBe(123456)
    })

    test('parses plain integer as cents if large, otherwise treat as cents', () => {
      expect(PriceValidator.formatToNumber('100000')).toBe(100000) // already in cents
      expect(PriceValidator.formatToNumber('100')).toBe(100) // 100 cents
    })

    test('parses plain decimal', () => {
      expect(PriceValidator.formatToNumber('1000.00')).toBe(100000)
    })

    test('returns NaN for negative or too large values', () => {
      expect(Number.isNaN(PriceValidator.formatToNumber('-1.00'))).toBeTruthy()
      // > 1_000_000 reais -> NaN
      expect(Number.isNaN(PriceValidator.formatToNumber('1000000.01'))).toBeTruthy()
    })

    test('accepts number inputs', () => {
      expect(PriceValidator.formatToNumber(1234.56)).toBe(1234.56)
    })
  })

  describe('isValid', () => {
    it('validates correct formats', () => {
      expect(PriceValidator.isValid('R$1.000,00')).toBeTruthy()
      expect(PriceValidator.isValid('100000')).toBeTruthy()
    })

    it('rejects invalid formats', () => {
      expect(PriceValidator.isValid('invalid')).toBeFalsy()
    })
  })

  describe('extra edge cases', () => {
    it('rejects NaN and negative numbers', () => {
      expect(PriceValidator.isValid(NaN as any)).toBe(false)
      expect(PriceValidator.isValid(-10 as any)).toBe(false)
      expect(Number.isNaN(PriceValidator.formatToNumber('abc'))).toBe(true)
    })

    it('rejects overly large values', () => {
      // > 1_000_000 reais
      expect(Number.isNaN(PriceValidator.formatToNumber('1000001.00'))).toBe(true)
    })
  })

  describe('decorator isValidPrice integration', () => {
    it('works with class-validator for string input and rejects non-string', async () => {
      // create a small DTO to validate decorator behavior
      class D {
        @isValidPrice()
        price!: string
      }

      const good = new D()
      good.price = 'R$10,00'
      const okErrors = await validate(good)
      expect(okErrors.length).toBe(0)

      const bad = new D()
      bad.price = 123 as any
      const badErrors = await validate(bad)
      expect(badErrors.length).toBeGreaterThan(0)
    })
  })
})

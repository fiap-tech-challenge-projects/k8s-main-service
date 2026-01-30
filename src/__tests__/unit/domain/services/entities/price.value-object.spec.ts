import { InvalidPriceException } from '@domain/services/exceptions'
import { Price } from '@domain/services/value-objects'

describe('Price', () => {
  describe('create', () => {
    it('should create a valid Price value object from formatted string', () => {
      const price = Price.create('R$ 1.200,00')
      expect(price.getFormatted()).toBe('R$\u00A01.200,00')
      expect(price.getValue()).toBe(120000) // 1200 reais in cents
      expect(price.getReaisValue()).toBe(1200) // 1200 reais
    })

    it('should create a valid Price value object from decimal string', () => {
      const price = Price.create('1234.56')
      expect(price.getFormatted()).toBe('R$\u00A01.234,56')
      expect(price.getValue()).toBe(123456) // 1234.56 reais in cents
      expect(price.getReaisValue()).toBe(1234.56) // 1234.56 reais
    })

    it('should create a valid Price value object from large number string', () => {
      const price = Price.create('100000')
      expect(price.getFormatted()).toBe('R$\u00A01.000,00')
      expect(price.getValue()).toBe(100000) // 100000 cents = 1000 reais
      expect(price.getReaisValue()).toBe(1000) // 1000 reais
    })

    it('should create a valid Price value object from small number string', () => {
      const price = Price.create('150')
      expect(price.getFormatted()).toBe('R$\u00A01,50')
      expect(price.getValue()).toBe(150) // 150 cents
      expect(price.getReaisValue()).toBe(1.5) // 1.50 reais
    })

    it('should create a valid Price value object from number', () => {
      const price = Price.create(150)
      expect(price.getFormatted()).toBe('R$\u00A01,50')
      expect(price.getValue()).toBe(150) // 150 cents
      expect(price.getReaisValue()).toBe(1.5) // 1.50 reais
    })

    it('should create a valid Price value object from large number', () => {
      const price = Price.create(1000)
      expect(price.getFormatted()).toBe('R$\u00A010,00')
      expect(price.getValue()).toBe(1000) // 1000 cents
      expect(price.getReaisValue()).toBe(10) // 10 reais
    })

    it('should create a valid Price value object from cents number', () => {
      const price = Price.create(100000)
      expect(price.getFormatted()).toBe('R$\u00A01.000,00')
      expect(price.getValue()).toBe(100000) // 100000 cents
      expect(price.getReaisValue()).toBe(1000) // 1000 reais
    })

    it('should handle all input formats correctly', () => {
      const testCases = [
        { input: 'R$1000.00', expectedCents: 100000, expectedFormatted: 'R$\u00A01.000,00' },
        { input: '100000', expectedCents: 100000, expectedFormatted: 'R$\u00A01.000,00' },
        { input: '1000.00', expectedCents: 100000, expectedFormatted: 'R$\u00A01.000,00' },
        { input: '1000,00', expectedCents: 100000, expectedFormatted: 'R$\u00A01.000,00' },
        { input: 'R$1.000,00', expectedCents: 100000, expectedFormatted: 'R$\u00A01.000,00' },
        { input: 'R$1,000.00', expectedCents: 100000, expectedFormatted: 'R$\u00A01.000,00' },
        { input: '100', expectedCents: 100, expectedFormatted: 'R$\u00A01,00' },
      ]

      testCases.forEach(({ input, expectedCents, expectedFormatted }) => {
        const price = Price.create(input)
        expect(price.getValue()).toBe(expectedCents)
        expect(price.getFormatted()).toBe(expectedFormatted)
      })
    })

    it('should throw InvalidPriceException for negative price', () => {
      expect(() => Price.create(-50)).toThrow(InvalidPriceException)
    })

    it('should throw InvalidPriceException for invalid string format', () => {
      expect(() => Price.create('invalid-price')).toThrow(InvalidPriceException)
    })

    it('should throw InvalidPriceException for empty string', () => {
      expect(() => Price.create('')).toThrow(InvalidPriceException)
    })
  })

  describe('formatted', () => {
    it('should format price to Brazilian currency', () => {
      const price = Price.create('R$ 1.200,00')
      expect(price.getFormatted()).toEqual('R$\u00A01.200,00')
    })
  })
})

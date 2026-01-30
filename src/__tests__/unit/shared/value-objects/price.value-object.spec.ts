import { InvalidPriceException } from '@shared/exceptions'
import { Price } from '@shared/value-objects'

describe('Price value object', () => {
  it('creates from string and number and formats correctly', () => {
    const p1 = Price.create('1000,00')
    expect(p1.getValue()).toBe(100000)
    expect(p1.getReaisValue()).toBe(1000)
    expect(typeof p1.getFormatted()).toBe('string')

    const p2 = Price.create(2500)
    expect(p2.getValue()).toBe(2500)
  })

  it('throws on invalid price', () => {
    expect(() => Price.create(-50)).toThrow(InvalidPriceException)
  })
})

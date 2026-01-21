import { InvalidPriceException } from '@domain/services/exceptions'

describe('InvalidPriceException', () => {
  it('should create exception with string value', () => {
    const exception = new InvalidPriceException('invalid-price')

    expect(exception.message).toBe(
      'Invalid price: "invalid-price". Expected format: "R$1000.00", "100000", "1000.00", "1000,00", "R$1.000,00", or "R$1,000.00"',
    )
  })

  it('should create exception with number value', () => {
    const exception = new InvalidPriceException(-5)

    expect(exception.message).toBe(
      'Invalid price: "-5". Expected format: "R$1000.00", "100000", "1000.00", "1000,00", "R$1.000,00", or "R$1,000.00"',
    )
  })

  it('should extend DomainException', () => {
    const exception = new InvalidPriceException('invalid')

    expect(exception).toBeInstanceOf(Error)
  })
})

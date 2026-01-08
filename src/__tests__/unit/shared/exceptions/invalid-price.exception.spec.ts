import { InvalidPriceException } from '@shared/exceptions'

describe('InvalidPriceException', () => {
  it('includes value in message and sets name', () => {
    const ex = new InvalidPriceException('abc')
    expect(ex.message).toContain('Invalid price')
    expect(ex.message).toContain('abc')
    expect(ex.name).toBe('InvalidPriceException')
  })
})

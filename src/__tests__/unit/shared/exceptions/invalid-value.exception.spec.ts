import { InvalidValueException } from '@shared/exceptions'

describe('InvalidValueException', () => {
  it('formats message and has class name', () => {
    const ex = new InvalidValueException('X', 'must be numeric')

    expect(ex.message).toBe("Invalid value 'X': must be numeric")
    expect(ex.name).toBe('InvalidValueException')
  })
})

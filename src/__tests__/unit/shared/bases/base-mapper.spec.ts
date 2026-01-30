import { validateBaseMapper } from '@shared'

describe('validateBaseMapper', () => {
  it('throws when provided value is not a class (function)', () => {
    expect(() => validateBaseMapper({}, 'NotAClass')).toThrow('NotAClass must be a class')
  })

  it('throws when class misses required static methods', () => {
    class Incomplete {}
    expect(() => validateBaseMapper(Incomplete, 'Incomplete')).toThrow(
      /Incomplete must implement the following static methods:/,
    )
  })

  it('does not throw when class implements required static methods', () => {
    class Complete {
      static toResponseDto() {}
      static toResponseDtoArray() {}
      static fromCreateDto() {}
      static fromUpdateDto() {}
    }

    expect(() => validateBaseMapper(Complete, 'Complete')).not.toThrow()
  })
})

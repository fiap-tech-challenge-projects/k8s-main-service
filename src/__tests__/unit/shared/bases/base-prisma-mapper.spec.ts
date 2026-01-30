import { validateBasePrismaMapper } from '@shared/bases'

describe('validateBasePrismaMapper', () => {
  it('throws when provided value is not a class', () => {
    expect(() => validateBasePrismaMapper({}, 'NotAClass')).toThrow('NotAClass must be a class')
  })

  it('throws when class misses required static methods', () => {
    class Incomplete {}
    expect(() => validateBasePrismaMapper(Incomplete, 'Incomplete')).toThrow(
      /Incomplete must implement the following static methods:/,
    )
  })

  it('does not throw when class implements required static methods', () => {
    class Complete {
      static toDomain() {}
      static toDomainMany() {}
      static toPrismaCreate() {}
      static toPrismaUpdate() {}
    }

    expect(() => validateBasePrismaMapper(Complete, 'Complete')).not.toThrow()
  })
})

import { LicensePlate } from '@domain/vehicles/value-objects'
import { InvalidValueException } from '@shared'

describe('LicensePlate Value Object', () => {
  it('creates and exposes formatted/clean', () => {
    const licensePlate = LicensePlate.create('abc-1234')
    expect(licensePlate.formatted).toBe('ABC-1234')
    expect(licensePlate.clean).toBe('ABC1234')
  })

  it('throws for invalid inputs', () => {
    expect(() => LicensePlate.create('123-ABCD')).toThrow(InvalidValueException)
    expect(() => LicensePlate.create('')).toThrow(InvalidValueException)
  })
})

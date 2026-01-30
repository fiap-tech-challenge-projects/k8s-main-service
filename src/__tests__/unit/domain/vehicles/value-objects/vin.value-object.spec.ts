import { Vin } from '@domain/vehicles/value-objects'
import { InvalidValueException } from '@shared'

describe('Vin Value Object', () => {
  it('should create with valid VIN and expose helpers', () => {
    const vin = Vin.create('1HGBH41JXMN109186')
    expect(vin.formatted).toBe('1HGB-H41JX-MN109-186')
    expect(vin.clean).toBe('1HGBH41JXMN109186')
  })

  it('should handle various input formats', () => {
    const vin = Vin.create('jh4na21644t000000')
    expect(vin.formatted).toBe('JH4N-A2164-4T000-000')
    expect(vin.clean).toBe('JH4NA21644T000000')
  })

  it('should throw for invalid VINs', () => {
    expect(() => Vin.create('1HGBH41JXMN10918')).toThrow(InvalidValueException)
    expect(() => Vin.create('')).toThrow(InvalidValueException)
  })

  it('should throw for invalid characters', () => {
    expect(() => Vin.create('1HGBH41JXMN10918I')).toThrow(InvalidValueException)
    expect(() => Vin.create('1HGBH41JXMN10918O')).toThrow(InvalidValueException)
    expect(() => Vin.create('1HGBH41JXMN10918Q')).toThrow(InvalidValueException)
  })
})

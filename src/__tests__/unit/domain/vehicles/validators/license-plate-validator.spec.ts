import { LicensePlateValidator } from '@domain/vehicles/validators'

describe('LicensePlateValidator', () => {
  it('should validate valid license plates', () => {
    expect(LicensePlateValidator.isValid('ABC-1234')).toBe(true)
    expect(LicensePlateValidator.isValid('XYZ-5678')).toBe(true)
    expect(LicensePlateValidator.isValid('DEF-9012')).toBe(true)
  })

  it('should return false for empty or non-string inputs', () => {
    expect(LicensePlateValidator.isValid('')).toBe(false)
    expect(LicensePlateValidator.isValid(123 as any)).toBe(false)
    expect(LicensePlateValidator.isValid(null as any)).toBe(false)
    expect(LicensePlateValidator.isValid(undefined as any)).toBe(false)
  })

  it('should return false for invalid length', () => {
    expect(LicensePlateValidator.isValid('ABC-123')).toBe(false)
    expect(LicensePlateValidator.isValid('ABC-12345')).toBe(false)
  })

  it('should return false for invalid format', () => {
    expect(LicensePlateValidator.isValid('123-ABCD')).toBe(false)
    expect(LicensePlateValidator.isValid('ABC-12A4')).toBe(false)
    expect(LicensePlateValidator.isValid('AB1-1234')).toBe(false)
  })

  it('should format license plates correctly', () => {
    expect(LicensePlateValidator.format('ABC1234')).toBe('ABC-1234')
    expect(LicensePlateValidator.format('abc-1234')).toBe('ABC-1234')
    expect(LicensePlateValidator.format('A B C 1 2 3 4')).toBe('ABC-1234')
  })

  it('should clean license plates correctly', () => {
    expect(LicensePlateValidator.clean('ABC-1234')).toBe('ABC1234')
    expect(LicensePlateValidator.clean('abc-1234')).toBe('ABC1234')
    expect(LicensePlateValidator.clean('A B C 1 2 3 4')).toBe('ABC1234')
  })
})

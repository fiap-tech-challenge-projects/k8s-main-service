import { VinValidator } from '@domain/vehicles/validators'

describe('VinValidator', () => {
  it('should validate valid VINs', () => {
    expect(VinValidator.isValid('1HGBH41JXMN109186')).toBe(true)
    expect(VinValidator.isValid('JH4NA21644T000000')).toBe(true)
    expect(VinValidator.isValid('WBAVB13506PT61328')).toBe(true)
  })

  it('should return false for empty or non-string inputs', () => {
    expect(VinValidator.isValid('')).toBe(false)
    expect(VinValidator.isValid(123 as any)).toBe(false)
    expect(VinValidator.isValid(null as any)).toBe(false)
    expect(VinValidator.isValid(undefined as any)).toBe(false)
  })

  it('should return false for invalid length', () => {
    expect(VinValidator.isValid('1HGBH41JXMN10918')).toBe(false)
    expect(VinValidator.isValid('1HGBH41JXMN1091867')).toBe(false)
  })

  it('should return false for invalid characters', () => {
    expect(VinValidator.isValid('1HGBH41JXMN10918I')).toBe(false)
    expect(VinValidator.isValid('1HGBH41JXMN10918O')).toBe(false)
    expect(VinValidator.isValid('1HGBH41JXMN10918Q')).toBe(false)
  })

  it('should format VINs correctly', () => {
    expect(VinValidator.format('1HGBH41JXMN109186')).toBe('1HGB-H41JX-MN109-186')
    expect(VinValidator.format('jh4na21644t000000')).toBe('JH4N-A2164-4T000-000')
  })

  it('should clean VINs correctly', () => {
    expect(VinValidator.clean('1HGB-H41J-XMN10-9186')).toBe('1HGBH41JXMN109186')
    expect(VinValidator.clean('jh4na21644t000000')).toBe('JH4NA21644T000000')
    expect(VinValidator.clean('1 H G B H 4 1 J X M N 1 0 9 1 8 6')).toBe('1HGBH41JXMN109186')
  })
})

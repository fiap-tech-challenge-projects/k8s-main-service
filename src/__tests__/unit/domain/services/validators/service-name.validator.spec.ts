import { ServiceNameValidator } from '@domain/services/validators'

describe('ServiceNameValidator', () => {
  it('validates a good name', () => {
    expect(ServiceNameValidator.isValid('Oil change - basic')).toBe(true)
  })

  it('rejects empty name', () => {
    expect(() => ServiceNameValidator.validate('')).toThrow('Service name is required')
  })

  it('rejects too short name', () => {
    expect(() => ServiceNameValidator.validate('A')).toThrow('Service name must be at least')
  })

  it('rejects too long name', () => {
    const long = 'A'.repeat(200)
    expect(() => ServiceNameValidator.validate(long)).toThrow('Service name must not exceed')
  })

  it('isValid returns false for invalid name', () => {
    expect(ServiceNameValidator.isValid('Bad<>Name')).toBe(false)
  })

  it('rejects invalid characters', () => {
    expect(() => ServiceNameValidator.validate('Bad<>Name')).toThrow(
      'Service name contains invalid characters',
    )
  })
})

import { ServiceDescriptionValidator } from '@domain/services/validators'

describe('ServiceDescriptionValidator', () => {
  it('validates a good description', () => {
    expect(ServiceDescriptionValidator.isValid('This is a long enough description')).toBe(true)
  })

  it('rejects empty description', () => {
    expect(() => ServiceDescriptionValidator.validate('')).toThrow(
      'Service description is required and must be a string',
    )
  })

  it('rejects too short description', () => {
    expect(() => ServiceDescriptionValidator.validate('1234')).toThrow(
      'Service description must be at least',
    )
  })

  it('rejects too long description and isValid false', () => {
    const long = 'A'.repeat(1000)
    expect(() => ServiceDescriptionValidator.validate(long)).toThrow(
      'Service description must not exceed',
    )
    expect(ServiceDescriptionValidator.isValid(long)).toBe(false)
  })
})

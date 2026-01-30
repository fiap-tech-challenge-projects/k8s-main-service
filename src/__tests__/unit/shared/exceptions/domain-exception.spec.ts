import { DomainException } from '@shared'

describe('DomainException', () => {
  it('should set name and message correctly', () => {
    const error = new (class extends DomainException {})('Test message', 'CustomDomainException')
    expect(error.message).toBe('Test message')
    expect(error.name).toBe('CustomDomainException')
  })
})

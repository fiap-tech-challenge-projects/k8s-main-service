import { EmailValidator } from '@domain/email/validators'

describe('EmailValidator', () => {
  it('accepts valid emails and rejects invalid ones', () => {
    expect(EmailValidator.isValid('user@example.com')).toBe(true)
    expect(EmailValidator.isValidFormat('user@domain')).toBe(false)
    expect(EmailValidator.isValidLength('a@b.co')).toBe(true)
    expect(EmailValidator.isValidDomain('user@example.com')).toBe(true)
    expect(EmailValidator.isValid('')).toBe(false)
  })
})

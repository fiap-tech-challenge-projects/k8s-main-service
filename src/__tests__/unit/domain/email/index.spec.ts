import * as emailDomain from '@domain/email'

describe('domain/email index barrel', () => {
  it('re-exports interfaces or symbols', () => {
    expect(Object.keys(emailDomain).length).toBeGreaterThan(0)
  })
})

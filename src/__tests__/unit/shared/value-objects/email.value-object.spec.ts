import { Email } from '@shared'

describe('Email VO', () => {
  it('should trim and normalize', () => {
    const e = new Email('  Foo.Bar+tag@Example.COM  ')
    expect(e.value).toBe('Foo.Bar+tag@Example.COM')
    expect(e.normalized).toBe('foo.bar+tag@example.com')
    expect(e.localPart).toBe('Foo.Bar+tag')
    expect(e.domain).toBe('Example.COM')
  })

  it('should validate regex and length', () => {
    expect(() => new Email('invalid')).toThrow()
    const longLocal = 'a'.repeat(255)
    expect(() => new Email(`${longLocal}@ex.com`)).toThrow()
  })

  it('equals and hashCode', () => {
    const a = new Email('a@b.com')
    const b = new Email('a@b.com')
    const c = new Email('c@d.com')
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
    expect(a.hashCode()).toBe(b.hashCode())
  })

  it('static create', () => {
    expect(Email.create('x@y.com') instanceof Email).toBe(true)
  })
})

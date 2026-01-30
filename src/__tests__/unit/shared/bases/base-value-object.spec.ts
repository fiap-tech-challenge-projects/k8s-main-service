import { BaseValueObject } from '@shared'

class TextVO extends BaseValueObject<string> {
  protected validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('invalid')
    }
  }
}

describe('BaseValueObject', () => {
  it('should expose value and validate in constructor', () => {
    const vo = new TextVO('hello')
    expect(vo.value).toBe('hello')
  })

  it('should throw on invalid value', () => {
    expect(() => new TextVO('')).toThrow('invalid')
  })

  it('equals behavior', () => {
    const a = new TextVO('x')
    const b = new TextVO('x')
    const c = new TextVO('y')
    expect(a.equals(a)).toBe(true)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
    expect(a.equals(null as unknown as TextVO)).toBe(false)
  })

  it('hashCode stable for same value', () => {
    const a = new TextVO('same')
    const b = new TextVO('same')
    expect(a.hashCode()).toBe(b.hashCode())
  })

  it('toString returns stringified value', () => {
    const a = new TextVO('ok')
    expect(a.toString()).toBe('ok')
  })
})

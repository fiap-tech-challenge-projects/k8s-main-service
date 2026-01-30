import { CpfCnpj } from '@domain/clients/value-objects'
import { InvalidValueException } from '@shared'

describe('CpfCnpj Value Object', () => {
  it('should create CPF and expose helpers', () => {
    const vo = CpfCnpj.create('123.456.789-09')
    expect(vo.isCpf).toBe(true)
    expect(vo.isCnpj).toBe(false)
    expect(vo.formatted).toBe('123.456.789-09')
    expect(vo.clean).toBe('12345678909')
  })

  it('should create CNPJ and expose helpers', () => {
    const vo = CpfCnpj.create('11.222.333/0001-81')
    expect(vo.isCpf).toBe(false)
    expect(vo.isCnpj).toBe(true)
    expect(vo.formatted).toBe('11.222.333/0001-81')
    expect(vo.clean).toBe('11222333000181')
  })

  it('should throw for invalid length', () => {
    expect(() => CpfCnpj.create('123')).toThrow(InvalidValueException)
  })

  it('should throw for invalid CPF content', () => {
    expect(() => CpfCnpj.create('111.111.111-11')).toThrow(InvalidValueException)
  })

  it('should throw for invalid CNPJ content', () => {
    expect(() => CpfCnpj.create('11.111.111/1111-11')).toThrow(InvalidValueException)
  })
})

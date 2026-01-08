import { Cnpj } from '@domain/clients/value-objects'
import { InvalidValueException } from '@shared'

describe('Cnpj Value Object', () => {
  it('should create with valid cnpj and expose helpers', () => {
    const cnpj = Cnpj.create('11222333000181')
    expect(cnpj.formatted).toBe('11.222.333/0001-81')
    expect(cnpj.clean).toBe('11222333000181')
  })

  it('should throw for invalid cnpj', () => {
    expect(() => Cnpj.create('11111111111111')).toThrow(InvalidValueException)
  })
})

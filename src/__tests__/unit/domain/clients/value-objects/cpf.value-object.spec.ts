import { Cpf } from '@domain/clients/value-objects'
import { InvalidValueException } from '@shared'

describe('Cpf Value Object', () => {
  it('should create with valid cpf and expose helpers', () => {
    const cpf = Cpf.create('12345678909')
    expect(cpf.formatted).toBe('123.456.789-09')
    expect(cpf.clean).toBe('12345678909')
  })

  it('should throw for invalid cpf', () => {
    expect(() => Cpf.create('11111111111')).toThrow(InvalidValueException)
  })
})

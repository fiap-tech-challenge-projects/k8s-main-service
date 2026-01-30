import { ValidatorConstraint } from 'class-validator'

import { IsCpf } from '@domain/clients/validators'
import { Cpf } from '@domain/clients/value-objects'

@ValidatorConstraint()
class TestClass {
  @IsCpf()
  cpf: string
}

describe('IsCpf', () => {
  let testClass: TestClass

  beforeEach(() => {
    testClass = new TestClass()
  })

  it('should validate CPF correctly', () => {
    testClass.cpf = '123.456.789-09'
    expect(Cpf.isValid(testClass.cpf)).toBe(true)

    testClass.cpf = '111.111.111-11'
    expect(Cpf.isValid(testClass.cpf)).toBe(false)

    testClass.cpf = '123'
    expect(Cpf.isValid(testClass.cpf)).toBe(false)
  })

  it('should format and clean values', () => {
    testClass.cpf = '12345678909'
    expect(new Cpf(testClass.cpf).formatted).toBe('123.456.789-09')

    testClass.cpf = '123.456.789-09'
    expect(new Cpf(testClass.cpf).clean).toBe('12345678909')
  })

  it('should validate invalid lengths', () => {
    testClass.cpf = ''
    expect(Cpf.isValid(testClass.cpf)).toBe(false)

    testClass.cpf = '1'.repeat(10)
    expect(Cpf.isValid(testClass.cpf)).toBe(false)

    testClass.cpf = '1'.repeat(12)
    expect(Cpf.isValid(testClass.cpf)).toBe(false)
  })

  it('should return false for all identical digits', () => {
    testClass.cpf = '000.000.000-00'
    expect(Cpf.isValid(testClass.cpf)).toBe(false)

    testClass.cpf = '99999999999'
    expect(Cpf.isValid(testClass.cpf)).toBe(false)
  })

  it('should return false for invalid check digits', () => {
    testClass.cpf = '123.456.789-00'
    expect(Cpf.isValid(testClass.cpf)).toBe(false)

    testClass.cpf = '123.456.789-19'
    expect(Cpf.isValid(testClass.cpf)).toBe(false)
  })
})

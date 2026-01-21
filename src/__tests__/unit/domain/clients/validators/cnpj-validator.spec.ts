import { ValidatorConstraint } from 'class-validator'

import { IsCnpj } from '@domain/clients/validators'
import { Cnpj } from '@domain/clients/value-objects'

@ValidatorConstraint()
class TestClass {
  @IsCnpj()
  cnpj: string
}

describe('IsCnpj', () => {
  let testClass: TestClass

  beforeEach(() => {
    testClass = new TestClass()
  })

  it('should validate CNPJ correctly', () => {
    testClass.cnpj = '11.222.333/0001-81'
    expect(Cnpj.isValid(testClass.cnpj)).toBe(true)

    testClass.cnpj = '11.111.111/1111-11'
    expect(Cnpj.isValid(testClass.cnpj)).toBe(false)

    testClass.cnpj = '123'
    expect(Cnpj.isValid(testClass.cnpj)).toBe(false)
  })

  it('should format and clean values', () => {
    testClass.cnpj = '11222333000181'
    expect(new Cnpj(testClass.cnpj).formatted).toBe('11.222.333/0001-81')

    testClass.cnpj = '11.222.333/0001-81'
    expect(new Cnpj(testClass.cnpj).clean).toBe('11222333000181')
  })

  it('should validate invalid lengths', () => {
    testClass.cnpj = ''
    expect(Cnpj.isValid(testClass.cnpj)).toBe(false)

    testClass.cnpj = '1'.repeat(13)
    expect(Cnpj.isValid(testClass.cnpj)).toBe(false)

    testClass.cnpj = '1'.repeat(15)
    expect(Cnpj.isValid(testClass.cnpj)).toBe(false)
  })

  it('should return false for all identical digits', () => {
    testClass.cnpj = '00.000.000/0000-00'
    expect(Cnpj.isValid(testClass.cnpj)).toBe(false)

    testClass.cnpj = '99999999999999'
    expect(Cnpj.isValid(testClass.cnpj)).toBe(false)
  })

  it('should return false for invalid check digits', () => {
    testClass.cnpj = '11.222.333/0001-80'
    expect(Cnpj.isValid(testClass.cnpj)).toBe(false)

    testClass.cnpj = '11.222.333/0001-91'
    expect(Cnpj.isValid(testClass.cnpj)).toBe(false)
  })
})

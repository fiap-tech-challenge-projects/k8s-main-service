import { ValidatorConstraint } from 'class-validator'

import { IsCpfCnpj } from '@domain/clients/validators'
import { CpfCnpj } from '@domain/clients/value-objects'

@ValidatorConstraint()
class TestClass {
  @IsCpfCnpj()
  cpfCnpj: string
}

describe('IsCpfCnpj', () => {
  let testClass: TestClass

  beforeEach(() => {
    testClass = new TestClass()
  })

  it('should validate CPF and CNPJ correctly', () => {
    testClass.cpfCnpj = '123.456.789-09'
    expect(CpfCnpj.isValid(testClass.cpfCnpj)).toBe(true)

    testClass.cpfCnpj = '11.222.333/0001-81'
    expect(CpfCnpj.isValid(testClass.cpfCnpj)).toBe(true)

    testClass.cpfCnpj = '123'
    expect(CpfCnpj.isValid(testClass.cpfCnpj)).toBe(false)
  })
})

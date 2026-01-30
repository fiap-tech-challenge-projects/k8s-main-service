import 'reflect-metadata'
import { validate } from 'class-validator'

import { IsCnpj, IsCpf, IsCpfCnpj } from '@domain/clients/validators'

class DecoratorTestDto {
  @IsCpf()
  cpf!: string

  @IsCnpj()
  cnpj!: string

  @IsCpfCnpj()
  cpfCnpj!: string
}

describe('CPF/CNPJ Decorators', () => {
  it('should validate properties using decorators', async () => {
    const dto = new DecoratorTestDto()
    dto.cpf = '123.456.789-09'
    dto.cnpj = '11.222.333/0001-81'
    dto.cpfCnpj = '123.456.789-09'

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should produce validation errors for invalid values', async () => {
    const dto = new DecoratorTestDto()
    dto.cpf = 'invalid'
    dto.cnpj = 'invalid'
    dto.cpfCnpj = 'invalid'

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThanOrEqual(3)
    const props = errors.map((e) => e.property)
    expect(props).toEqual(expect.arrayContaining(['cpf', 'cnpj', 'cpfCnpj']))
  })

  it('should produce validation errors for non-string inputs (decorators)', async () => {
    const dto = new DecoratorTestDto()
    ;(dto as any).cpf = 123
    ;(dto as any).cnpj = 456
    ;(dto as any).cpfCnpj = 789

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThanOrEqual(3)
    const props = errors.map((e) => e.property)
    expect(props).toEqual(expect.arrayContaining(['cpf', 'cnpj', 'cpfCnpj']))
  })
})

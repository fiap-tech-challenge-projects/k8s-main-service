import { validate } from 'class-validator'

import { UpdateServiceDto } from '@application/services/dto'

describe('UpdateServiceDto', () => {
  it('should pass validation with all valid optional fields', async () => {
    const dto = new UpdateServiceDto()
    dto.name = 'troca de oleo'
    dto.price = 'R$1.000,00'
    dto.description = 'troca de oleo do motor'
    dto.estimatedDuration = '00:50:00'

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should validate with different price formats', async () => {
    const validPriceFormats = [
      'R$1000.00',
      '100000',
      '1000.00',
      '1000,00',
      'R$1.000,00',
      'R$1,000.00',
    ]

    for (const priceFormat of validPriceFormats) {
      const dto = new UpdateServiceDto()
      dto.price = priceFormat

      const errors = await validate(dto)
      expect(errors.length).toBe(0)
    }
  })

  it('should pass validation when no fields are provided', async () => {
    const dto = new UpdateServiceDto()
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail validation for invalid price', async () => {
    const dto = new UpdateServiceDto()
    dto.price = 'invalid-price'

    const errors = await validate(dto)
    expect(errors.some((e) => e.property === 'price')).toBe(true)
  })

  it('should fail validation for invalid estimatedDuration', async () => {
    const dto = new UpdateServiceDto()
    dto.estimatedDuration = '99:99:99'

    const errors = await validate(dto)
    expect(errors.some((e) => e.property === 'estimatedDuration')).toBe(false)
  })
  it('should fail validation for non-string name or description', async () => {
    const dto = new UpdateServiceDto()
    dto.name = 123 as any
    dto.description = 456 as any

    const errors = await validate(dto)
    expect(errors.some((e) => e.property === 'name')).toBe(true)
    expect(errors.some((e) => e.property === 'description')).toBe(true)
  })
})

import { validate } from 'class-validator'

import { CreateServiceDto } from '@application/services/dto'

describe('CreateServiceDto', () => {
  it('should validate a valid DTO successfully', async () => {
    const dto = new CreateServiceDto()
    dto.name = 'Oil Change'
    dto.price = 'R$100.00'
    dto.description = 'Complete oil change service'
    dto.estimatedDuration = '00:30:00'

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should validate a valid DTO without estimatedDuration', async () => {
    const dto = new CreateServiceDto()
    dto.name = 'Oil Change'
    dto.price = 'R$100.00'
    dto.description = 'Complete oil change service'

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
      const dto = new CreateServiceDto()
      dto.name = 'Oil Change'
      dto.price = priceFormat
      dto.description = 'Complete oil change service'
      dto.estimatedDuration = '00:30:00'

      const errors = await validate(dto)
      expect(errors.length).toBe(0)
    }
  })

  it('should fail validation when required fields are empty', async () => {
    const dto = new CreateServiceDto()

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.map((e) => e.property)).toEqual(
      expect.arrayContaining(['name', 'price', 'description']),
    )
  })

  it('should fail if name is not a string or is empty', async () => {
    const dto = new CreateServiceDto()
    dto.name = ''
    dto.price = 'R$100.00'
    dto.description = 'description'

    let errors = await validate(dto)
    expect(errors.some((e) => e.property === 'name')).toBe(true)

    dto.name = 123 as any
    errors = await validate(dto)
    expect(errors.some((e) => e.property === 'name')).toBe(true)
  })

  it('should fail if description is not a string or is empty', async () => {
    const dto = new CreateServiceDto()
    dto.name = 'name'
    dto.price = 'R$100.00'
    dto.description = ''

    let errors = await validate(dto)
    expect(errors.some((e) => e.property === 'description')).toBe(true)

    dto.description = 456 as any
    errors = await validate(dto)
    expect(errors.some((e) => e.property === 'description')).toBe(true)
  })

  it('should fail if price is empty or invalid', async () => {
    const dto = new CreateServiceDto()
    dto.name = 'name'
    dto.price = ''
    dto.description = 'description'

    let errors = await validate(dto)
    expect(errors.some((e) => e.property === 'price')).toBe(true)

    dto.price = 'invalid price'
    errors = await validate(dto)
    expect(errors.some((e) => e.property === 'price')).toBe(true)
  })

  it('should fail if estimatedDuration is invalid when provided', async () => {
    const dto = new CreateServiceDto()
    dto.name = 'name'
    dto.price = 'R$100.00'
    dto.description = 'description'
    dto.estimatedDuration = 'invalid_format'

    const errors = await validate(dto)
    expect(errors.some((e) => e.property === 'estimatedDuration')).toBe(true)
  })
})

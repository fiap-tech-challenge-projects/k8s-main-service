import 'reflect-metadata'
import { validate } from 'class-validator'

import { IsLicensePlate, IsVin } from '@domain/vehicles/validators'

class VehicleDecoratorTestDto {
  @IsLicensePlate()
  licensePlate!: string

  @IsVin()
  vin!: string
}

describe('Vehicle Validator Decorators', () => {
  it('should validate properties using decorators', async () => {
    const dto = new VehicleDecoratorTestDto()
    dto.licensePlate = 'ABC-1234'
    dto.vin = '1HGBH41JXMN109186'

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should produce validation errors for invalid values', async () => {
    const dto = new VehicleDecoratorTestDto()
    dto.licensePlate = 'invalid'
    dto.vin = 'invalid'

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThanOrEqual(2)
    const props = errors.map((e) => e.property)
    expect(props).toEqual(expect.arrayContaining(['licensePlate', 'vin']))
  })

  it('should produce validation errors for non-string inputs', async () => {
    const dto = new VehicleDecoratorTestDto()
    ;(dto as any).licensePlate = 123
    ;(dto as any).vin = 456

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThanOrEqual(2)
    const props = errors.map((e) => e.property)
    expect(props).toEqual(expect.arrayContaining(['licensePlate', 'vin']))
  })
})

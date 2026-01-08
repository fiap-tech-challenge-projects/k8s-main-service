import { validate } from 'class-validator'

import { VehicleDtoFactory } from '@/__tests__/factories'
import { UpdateVehicleDto } from '@application/vehicles/dto'

describe('UpdateVehicleDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = VehicleDtoFactory.createUpdateVehicleDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation with partial data', async () => {
      const dto = VehicleDtoFactory.createPartialUpdateVehicleDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation with empty object', async () => {
      const dto = new UpdateVehicleDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    describe('licensePlate validation', () => {
      it('should pass validation when licensePlate is undefined', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ licensePlate: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when licensePlate format is invalid', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ licensePlate: 'INVALID' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('licensePlate')
      })

      it('should pass validation with valid license plate formats', async () => {
        const validLicensePlates = ['ABC-1234', 'XYZ-5678', 'DEF-9012']

        for (const licensePlate of validLicensePlates) {
          const dto = VehicleDtoFactory.createUpdateVehicleDto({ licensePlate })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })
    })

    describe('make validation', () => {
      it('should pass validation when make is undefined', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ make: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when make is not a string', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ make: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('make')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation with valid make', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ make: 'Toyota' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('model validation', () => {
      it('should pass validation when model is undefined', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ model: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when model is not a string', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ model: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('model')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation with valid model', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ model: 'Corolla' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('year validation', () => {
      it('should pass validation when year is undefined', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ year: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when year is too low', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ year: 1899 })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('year')
        expect(errors[0].constraints).toHaveProperty('min')
      })

      it('should fail validation when year is too high', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ year: 2031 })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('year')
        expect(errors[0].constraints).toHaveProperty('max')
      })

      it('should fail validation when year is not a number', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ year: '2022' as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('year')
        expect(errors[0].constraints).toHaveProperty('isNumber')
      })

      it('should pass validation with valid year range', async () => {
        const validYears = [1900, 2000, 2022, 2030]

        for (const year of validYears) {
          const dto = VehicleDtoFactory.createUpdateVehicleDto({ year })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })
    })

    describe('vin validation', () => {
      it('should pass validation when vin is undefined', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ vin: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid VIN format', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ vin: '1HGBH41JXMN109186' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation with invalid VIN format', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ vin: 'INVALID-VIN' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('vin')
      })
    })

    describe('color validation', () => {
      it('should pass validation when color is undefined', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ color: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid color', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ color: 'White' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when color is not a string', async () => {
        const dto = VehicleDtoFactory.createUpdateVehicleDto({ color: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('color')
        expect(errors[0].constraints).toHaveProperty('isString')
      })
    })

    it('should fail validation with multiple invalid fields', async () => {
      const dto = VehicleDtoFactory.createUpdateVehicleDto({
        licensePlate: 'INVALID',
        make: 123 as any,
        model: 123 as any,
        year: 1899,
        vin: 'INVALID-VIN',
        color: 123 as any,
      })

      const errors = await validate(dto)

      expect(errors).toHaveLength(6)
      expect(errors.map((e) => e.property)).toContain('licensePlate')
      expect(errors.map((e) => e.property)).toContain('make')
      expect(errors.map((e) => e.property)).toContain('model')
      expect(errors.map((e) => e.property)).toContain('year')
      expect(errors.map((e) => e.property)).toContain('vin')
      expect(errors.map((e) => e.property)).toContain('color')
    })
  })

  describe('dto structure', () => {
    it('should have all optional properties', () => {
      const dto = VehicleDtoFactory.createUpdateVehicleDto()

      expect(dto).toHaveProperty('licensePlate')
      expect(dto).toHaveProperty('make')
      expect(dto).toHaveProperty('model')
      expect(dto).toHaveProperty('year')
      expect(dto).toHaveProperty('vin')
      expect(dto).toHaveProperty('color')
    })

    it('should allow all properties to be undefined', () => {
      const dto: UpdateVehicleDto = {}

      expect(dto.licensePlate).toBeUndefined()
      expect(dto.make).toBeUndefined()
      expect(dto.model).toBeUndefined()
      expect(dto.year).toBeUndefined()
      expect(dto.vin).toBeUndefined()
      expect(dto.color).toBeUndefined()
    })
  })
})

import { validate } from 'class-validator'

import { VehicleDtoFactory } from '@/__tests__/factories'
import { CreateVehicleDto } from '@application/vehicles/dto'

describe('CreateVehicleDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = VehicleDtoFactory.createCreateVehicleDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation with minimal valid data', async () => {
      const dto = VehicleDtoFactory.createMinimalCreateVehicleDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    describe('licensePlate validation', () => {
      it('should fail validation when licensePlate is empty', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ licensePlate: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('licensePlate')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when licensePlate format is invalid', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ licensePlate: 'INVALID' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('licensePlate')
      })

      it('should pass validation with valid license plate formats', async () => {
        const validLicensePlates = ['ABC-1234', 'XYZ-5678', 'DEF-9012']

        for (const licensePlate of validLicensePlates) {
          const dto = VehicleDtoFactory.createCreateVehicleDto({ licensePlate })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })
    })

    describe('make validation', () => {
      it('should fail validation when make is empty', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ make: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('make')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when make is not a string', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ make: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('make')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation with valid make', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ make: 'Toyota' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('model validation', () => {
      it('should fail validation when model is empty', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ model: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('model')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when model is not a string', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ model: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('model')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation with valid model', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ model: 'Corolla' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('year validation', () => {
      it('should fail validation when year is too low', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ year: 1899 })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('year')
        expect(errors[0].constraints).toHaveProperty('min')
      })

      it('should fail validation when year is too high', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ year: 2031 })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('year')
        expect(errors[0].constraints).toHaveProperty('max')
      })

      it('should fail validation when year is not a number', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ year: '2022' as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('year')
        expect(errors[0].constraints).toHaveProperty('isNumber')
      })

      it('should pass validation with valid year range', async () => {
        const validYears = [1900, 2000, 2022, 2030]

        for (const year of validYears) {
          const dto = VehicleDtoFactory.createCreateVehicleDto({ year })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })
    })

    describe('clientId validation', () => {
      it('should fail validation when clientId is empty', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ clientId: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('clientId')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when clientId is not a string', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ clientId: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('clientId')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation with valid clientId', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ clientId: 'client-123' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('vin validation', () => {
      it('should pass validation when vin is undefined', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ vin: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid VIN format', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ vin: '1HGBH41JXMN109186' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation with invalid VIN format', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ vin: 'INVALID-VIN' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('vin')
      })
    })

    describe('color validation', () => {
      it('should pass validation when color is undefined', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ color: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid color', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ color: 'White' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when color is not a string', async () => {
        const dto = VehicleDtoFactory.createCreateVehicleDto({ color: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('color')
        expect(errors[0].constraints).toHaveProperty('isString')
      })
    })

    it('should fail validation with multiple invalid fields', async () => {
      const dto = VehicleDtoFactory.createCreateVehicleDto({
        licensePlate: '',
        make: '',
        model: '',
        year: 1899,
        clientId: '',
      })

      const errors = await validate(dto)

      expect(errors).toHaveLength(5)
      expect(errors.map((e) => e.property)).toContain('licensePlate')
      expect(errors.map((e) => e.property)).toContain('make')
      expect(errors.map((e) => e.property)).toContain('model')
      expect(errors.map((e) => e.property)).toContain('year')
      expect(errors.map((e) => e.property)).toContain('clientId')
    })
  })

  describe('dto structure', () => {
    it('should have all required properties', () => {
      const dto = VehicleDtoFactory.createCreateVehicleDto()

      expect(dto).toHaveProperty('licensePlate')
      expect(dto).toHaveProperty('make')
      expect(dto).toHaveProperty('model')
      expect(dto).toHaveProperty('year')
      expect(dto).toHaveProperty('clientId')
    })

    it('should allow optional properties to be undefined', () => {
      const dto: CreateVehicleDto = {
        licensePlate: 'ABC-1234',
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        clientId: 'client-123',
      }

      expect(dto.vin).toBeUndefined()
      expect(dto.color).toBeUndefined()
    })
  })
})

import { validate } from 'class-validator'

import { EmployeeDtoFactory } from '@/__tests__/factories'
import { UpdateEmployeeDto } from '@application/employees/dto'

describe('UpdateEmployeeDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = EmployeeDtoFactory.createUpdateEmployeeDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation with partial data', async () => {
      const dto = EmployeeDtoFactory.createPartialUpdateEmployeeDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation with empty object', async () => {
      const dto = new UpdateEmployeeDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    describe('name validation', () => {
      it('should fail validation when name is too short', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ name: 'A' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('minLength')
      })

      it('should fail validation when name is not a string', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ name: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation when name is undefined', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto()
        delete dto.name

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when name is null', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ name: null as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('email validation', () => {
      it('should fail validation when email format is invalid', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ email: 'invalid-email' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('email')
        expect(errors[0].constraints).toHaveProperty('isEmail')
      })

      it('should pass validation with valid email formats', async () => {
        const validEmails = [
          'user@example.com',
          'user.name@example.com',
          'user+tag@example.com',
          'user123@example-site.com',
        ]

        for (const email of validEmails) {
          const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ email })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })

      it('should pass validation when email is undefined', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto()
        delete dto.email

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when email is null', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ email: null as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('role validation', () => {
      it('should fail validation when role is not a string', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ role: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('role')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation when role is undefined', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto()
        delete dto.role

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when role is null', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ role: null as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('phone validation', () => {
      it('should fail validation when phone is not a string', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ phone: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('phone')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation when phone is undefined', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto()
        delete dto.phone

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when phone is null', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ phone: null as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid phone numbers', async () => {
        const validPhones = ['11999999999', '11988887777', '11977776666']

        for (const phone of validPhones) {
          const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ phone })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })

      it('should fail validation with invalid phone numbers', async () => {
        const invalidPhones = ['invalid-phone', '123', 'abc', '+55 11 99999', '+55 11 99999-99999']

        for (const phone of invalidPhones) {
          const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ phone })
          const errors = await validate(dto)
          expect(errors).toHaveLength(1)
          expect(errors[0].property).toBe('phone')
          expect(errors[0].constraints).toHaveProperty('isMobilePhone')
        }
      })
    })

    describe('specialty validation', () => {
      it('should fail validation when specialty is not a string', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ specialty: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('specialty')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation when specialty is undefined', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto()
        delete dto.specialty

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when specialty is null', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ specialty: null as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('isActive validation', () => {
      it('should pass validation when isActive is true', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ isActive: true })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when isActive is false', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ isActive: false })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when isActive is not a boolean', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ isActive: 'true' as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('isActive')
        expect(errors[0].constraints).toHaveProperty('isBoolean')
      })

      it('should pass validation when isActive is undefined', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto()
        delete dto.isActive

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when isActive is null', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({ isActive: null as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('multiple field validation', () => {
      it('should fail validation with multiple invalid fields', async () => {
        const dto = EmployeeDtoFactory.createUpdateEmployeeDto({
          name: 'A',
          email: 'invalid-email',
          role: 123 as any,
        })

        const errors = await validate(dto)

        expect(errors).toHaveLength(3)
        expect(errors.some((error) => error.property === 'name')).toBe(true)
        expect(errors.some((error) => error.property === 'email')).toBe(true)
        expect(errors.some((error) => error.property === 'role')).toBe(true)
      })
    })
  })

  describe('structure', () => {
    it('should have correct properties', () => {
      const dto = EmployeeDtoFactory.createUpdateEmployeeDto()

      expect(dto).toHaveProperty('name')
      expect(dto).toHaveProperty('email')
      expect(dto).toHaveProperty('role')
      expect(dto).toHaveProperty('phone')
      expect(dto).toHaveProperty('specialty')
      expect(dto).toHaveProperty('isActive')
    })

    it('should have correct types', () => {
      const dto = EmployeeDtoFactory.createUpdateEmployeeDto()

      expect(typeof dto.name).toBe('string')
      expect(typeof dto.email).toBe('string')
      expect(typeof dto.role).toBe('string')
      expect(typeof dto.phone).toBe('string')
      expect(typeof dto.specialty).toBe('string')
      expect(typeof dto.isActive).toBe('boolean')
    })

    it('should allow all properties to be optional', () => {
      const dto = new UpdateEmployeeDto()

      expect(dto.name).toBeUndefined()
      expect(dto.email).toBeUndefined()
      expect(dto.role).toBeUndefined()
      expect(dto.phone).toBeUndefined()
      expect(dto.specialty).toBeUndefined()
      expect(dto.isActive).toBeUndefined()
    })
  })
})

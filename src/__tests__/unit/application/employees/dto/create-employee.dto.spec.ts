import { validate } from 'class-validator'

import { EmployeeDtoFactory } from '@/__tests__/factories'

describe('CreateEmployeeDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = EmployeeDtoFactory.createCreateEmployeeDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation with minimal valid data', async () => {
      const dto = EmployeeDtoFactory.createMinimalCreateEmployeeDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    describe('name validation', () => {
      it('should fail validation when name is empty', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ name: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when name is too short', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ name: 'A' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('minLength')
      })

      it('should fail validation when name is not a string', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ name: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('isString')
      })
    })

    describe('email validation', () => {
      it('should fail validation when email is empty', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ email: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('email')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when email format is invalid', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ email: 'invalid-email' })

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
          const dto = EmployeeDtoFactory.createCreateEmployeeDto({ email })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })
    })

    describe('role validation', () => {
      it('should fail validation when role is empty', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ role: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('role')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when role is not a string', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ role: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('role')
        expect(errors[0].constraints).toHaveProperty('isString')
      })
    })

    describe('phone validation', () => {
      it('should pass validation when phone is undefined', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto()
        delete dto.phone

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when phone is null', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ phone: null as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid phone numbers', async () => {
        const validPhones = ['11999999999', '11988887777', '11977776666']

        for (const phone of validPhones) {
          const dto = EmployeeDtoFactory.createCreateEmployeeDto({ phone })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })

      it('should fail validation when phone is not a string', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ phone: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('phone')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should fail validation with invalid phone numbers', async () => {
        const invalidPhones = ['invalid-phone', '123', 'abc', '+55 11 99999', '+55 11 99999-99999']

        for (const phone of invalidPhones) {
          const dto = EmployeeDtoFactory.createCreateEmployeeDto({ phone })
          const errors = await validate(dto)
          expect(errors).toHaveLength(1)
          expect(errors[0].property).toBe('phone')
          expect(errors[0].constraints).toHaveProperty('isMobilePhone')
        }
      })
    })

    describe('specialty validation', () => {
      it('should pass validation when specialty is undefined', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto()
        delete dto.specialty

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when specialty is null', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ specialty: null as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when specialty is not a string', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ specialty: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('specialty')
        expect(errors[0].constraints).toHaveProperty('isString')
      })
    })

    describe('isActive validation', () => {
      it('should pass validation when isActive is undefined', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto()
        delete dto.isActive

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when isActive is true', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ isActive: true })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation when isActive is false', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ isActive: false })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when isActive is not a boolean', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({ isActive: 'true' as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('isActive')
        expect(errors[0].constraints).toHaveProperty('isBoolean')
      })
    })

    describe('multiple field validation', () => {
      it('should fail validation with multiple invalid fields', async () => {
        const dto = EmployeeDtoFactory.createCreateEmployeeDto({
          name: '',
          email: 'invalid-email',
          role: '',
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
      const dto = EmployeeDtoFactory.createCreateEmployeeDto()

      expect(dto).toHaveProperty('name')
      expect(dto).toHaveProperty('email')
      expect(dto).toHaveProperty('role')
      expect(dto).toHaveProperty('phone')
      expect(dto).toHaveProperty('specialty')
      expect(dto).toHaveProperty('isActive')
    })

    it('should have correct types', () => {
      const dto = EmployeeDtoFactory.createCreateEmployeeDto()

      expect(typeof dto.name).toBe('string')
      expect(typeof dto.email).toBe('string')
      expect(typeof dto.role).toBe('string')
      expect(typeof dto.phone).toBe('string')
      expect(typeof dto.specialty).toBe('string')
      expect(typeof dto.isActive).toBe('boolean')
    })
  })
})

import { validate } from 'class-validator'

import { ClientDtoFactory } from '@/__tests__/factories'
import { UpdateClientDto } from '@application/clients/dto'

describe('UpdateClientDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = ClientDtoFactory.createUpdateClientDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation with partial data', async () => {
      const dto = ClientDtoFactory.createPartialUpdateClientDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation when all fields are undefined', async () => {
      const dto = ClientDtoFactory.createUpdateClientDto({})

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    describe('name validation', () => {
      it('should fail validation when name is empty string', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ name: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('minLength')
      })

      it('should fail validation when name is too short', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ name: 'A' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('minLength')
      })

      it('should fail validation when name is not a string', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ name: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation when name is undefined', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ name: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid name', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ name: 'Valid Name' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('email validation', () => {
      it('should fail validation when email is empty string', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ email: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('email')
        expect(errors[0].constraints).toHaveProperty('isEmail')
      })

      it('should fail validation when email format is invalid', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ email: 'invalid-email' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('email')
        expect(errors[0].constraints).toHaveProperty('isEmail')
      })

      it('should pass validation when email is undefined', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ email: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid email formats', async () => {
        const validEmails = [
          'user@example.com',
          'user.name@example.com',
          'user+tag@example.com',
          'user123@example-site.com',
        ]

        for (const email of validEmails) {
          const dto = ClientDtoFactory.createUpdateClientDto({ email })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })
    })

    describe('phone validation', () => {
      it('should pass validation when phone is undefined', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ phone: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid phone numbers', async () => {
        const validPhones = ['11999999999', '11988887777', '11977776666']

        for (const phone of validPhones) {
          const dto = ClientDtoFactory.createUpdateClientDto({ phone })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })

      it('should fail validation when phone is not a string', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ phone: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('phone')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should fail validation with invalid phone numbers', async () => {
        const invalidPhones = ['invalid-phone', '123', 'abc', '+55 11 99999', '+55 11 99999-99999']

        for (const phone of invalidPhones) {
          const dto = ClientDtoFactory.createUpdateClientDto({ phone })
          const errors = await validate(dto)
          expect(errors).toHaveLength(1)
          expect(errors[0].property).toBe('phone')
          expect(errors[0].constraints).toHaveProperty('isMobilePhone')
        }
      })
    })

    describe('address validation', () => {
      it('should pass validation when address is undefined', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ address: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid address', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({
          address: 'Rua das Flores, 123 - São Paulo, SP',
        })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when address is not a string', async () => {
        const dto = ClientDtoFactory.createUpdateClientDto({ address: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('address')
        expect(errors[0].constraints).toHaveProperty('isString')
      })
    })

    it('should fail validation with multiple invalid fields', async () => {
      const dto = ClientDtoFactory.createUpdateClientDto({
        name: '',
        email: 'invalid-email',
        phone: 123 as any,
      })

      const errors = await validate(dto)

      expect(errors).toHaveLength(3)
      expect(errors.map((e) => e.property)).toContain('name')
      expect(errors.map((e) => e.property)).toContain('email')
      expect(errors.map((e) => e.property)).toContain('phone')
    })
  })

  describe('dto structure', () => {
    it('should have all optional properties', () => {
      const dto: UpdateClientDto = {
        name: 'Test Client',
        email: 'test@example.com',
        phone: '(11) 99999-9999',
        address: 'Test Address',
      }

      expect(dto).toHaveProperty('name')
      expect(dto).toHaveProperty('email')
      expect(dto).toHaveProperty('phone')
      expect(dto).toHaveProperty('address')
    })

    it('should allow all properties to be undefined', () => {
      const dto: UpdateClientDto = {}

      expect(dto.name).toBeUndefined()
      expect(dto.email).toBeUndefined()
      expect(dto.phone).toBeUndefined()
      expect(dto.address).toBeUndefined()
    })

    it('should allow partial updates', () => {
      const dto: UpdateClientDto = {
        name: 'Updated Name',
      }

      expect(dto.name).toBe('Updated Name')
      expect(dto.email).toBeUndefined()
      expect(dto.phone).toBeUndefined()
      expect(dto.address).toBeUndefined()
    })
  })
})

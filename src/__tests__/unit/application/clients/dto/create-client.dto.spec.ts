import { validate } from 'class-validator'

import { ClientDtoFactory } from '@/__tests__/factories'
import { CreateClientDto } from '@application/clients/dto'

describe('CreateClientDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = ClientDtoFactory.createCreateClientDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation with minimal valid data', async () => {
      const dto = ClientDtoFactory.createMinimalCreateClientDto()

      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    describe('name validation', () => {
      it('should fail validation when name is empty', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ name: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when name is too short', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ name: 'A' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('minLength')
      })

      it('should fail validation when name is not a string', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ name: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('name')
        expect(errors[0].constraints).toHaveProperty('isString')
      })
    })

    describe('email validation', () => {
      it('should fail validation when email is empty', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ email: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('email')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when email format is invalid', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ email: 'invalid-email' })

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
          const dto = ClientDtoFactory.createCreateClientDto({ email })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })
    })

    describe('cpfCnpj validation', () => {
      it('should fail validation when cpfCnpj is empty', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ cpfCnpj: '' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('cpfCnpj')
        expect(errors[0].constraints).toHaveProperty('isNotEmpty')
      })

      it('should fail validation when cpfCnpj is not a string', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ cpfCnpj: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('cpfCnpj')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should pass validation with valid CPF format', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ cpfCnpj: '12345678909' })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid CNPJ format', async () => {
        const dto = ClientDtoFactory.createCreateClientDtoWithCnpj()

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })
    })

    describe('phone validation', () => {
      it('should pass validation when phone is undefined', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ phone: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid phone numbers', async () => {
        const validPhones = ['11999999999', '11988887777', '11977776666']

        for (const phone of validPhones) {
          const dto = ClientDtoFactory.createCreateClientDto({ phone })
          const errors = await validate(dto)
          expect(errors).toHaveLength(0)
        }
      })

      it('should fail validation when phone is not a string', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ phone: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('phone')
        expect(errors[0].constraints).toHaveProperty('isString')
      })

      it('should fail validation with invalid phone numbers', async () => {
        const invalidPhones = ['invalid-phone', '123', 'abc', '+55 11 99999', '+55 11 99999-99999']

        for (const phone of invalidPhones) {
          const dto = ClientDtoFactory.createCreateClientDto({ phone })
          const errors = await validate(dto)
          expect(errors).toHaveLength(1)
          expect(errors[0].property).toBe('phone')
          expect(errors[0].constraints).toHaveProperty('isMobilePhone')
        }
      })
    })

    describe('address validation', () => {
      it('should pass validation when address is undefined', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ address: undefined })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should pass validation with valid address', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({
          address: 'Rua das Flores, 123 - São Paulo, SP',
        })

        const errors = await validate(dto)

        expect(errors).toHaveLength(0)
      })

      it('should fail validation when address is not a string', async () => {
        const dto = ClientDtoFactory.createCreateClientDto({ address: 123 as any })

        const errors = await validate(dto)

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('address')
        expect(errors[0].constraints).toHaveProperty('isString')
      })
    })

    it('should fail validation with multiple invalid fields', async () => {
      const dto = ClientDtoFactory.createCreateClientDto({
        name: '',
        email: 'invalid-email',
        cpfCnpj: '',
      })

      const errors = await validate(dto)

      expect(errors).toHaveLength(3)
      expect(errors.map((e) => e.property)).toContain('name')
      expect(errors.map((e) => e.property)).toContain('email')
      expect(errors.map((e) => e.property)).toContain('cpfCnpj')
    })
  })

  describe('dto structure', () => {
    it('should have all required properties', () => {
      const dto = ClientDtoFactory.createCreateClientDto()

      expect(dto).toHaveProperty('name')
      expect(dto).toHaveProperty('email')
      expect(dto).toHaveProperty('cpfCnpj')
      expect(dto).toHaveProperty('phone')
      expect(dto).toHaveProperty('address')
    })

    it('should allow optional properties to be undefined', () => {
      const dto: CreateClientDto = {
        name: 'Test Client',
        email: 'test@example.com',
        cpfCnpj: '12345678909',
      }

      expect(dto.phone).toBeUndefined()
      expect(dto.address).toBeUndefined()
    })
  })
})

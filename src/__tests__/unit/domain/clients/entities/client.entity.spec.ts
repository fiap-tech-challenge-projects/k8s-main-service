import { Client } from '@domain/clients/entities'
import { CpfCnpj } from '@domain/clients/value-objects'
import { InvalidValueException } from '@shared'

describe('Client Entity', () => {
  describe('create', () => {
    it('should create a client with valid CPF and email', () => {
      const client = Client.create(
        'John Doe',
        'John.Doe@Email.com',
        '12345678909',
        '(11) 99999-9999',
        'Street 1',
      )

      expect(client).toBeInstanceOf(Client)
      expect(client.name).toBe('John Doe')
      expect(client.getNormalizedEmail()).toBe('john.doe@email.com')
      expect(client.cpfCnpj).toBeInstanceOf(CpfCnpj)
      expect(client.getFormattedCpfCnpj()).toBe('123.456.789-09')
      expect(client.hasPhone()).toBe(true)
      expect(client.hasAddress()).toBe(true)
    })

    it('should create a client with CNPJ', () => {
      const client = Client.create('Company', 'contato@empresa.com.br', '11222333000181')

      expect(client.cpfCnpj).toBeInstanceOf(CpfCnpj)
      expect(client.getFormattedCpfCnpj()).toBe('11.222.333/0001-81')
      expect(client.hasPhone()).toBe(false)
      expect(client.hasAddress()).toBe(false)
    })

    it('should throw when email is invalid', () => {
      expect(() => Client.create('John Doe', 'invalid-email', '12345678909')).toThrow(
        InvalidValueException,
      )
    })

    it('should throw when CPF/CNPJ is invalid', () => {
      expect(() => Client.create('John Doe', 'john@doe.com', '123')).toThrow(InvalidValueException)
    })
  })

  describe('update', () => {
    it('should update provided fields and keep others intact', () => {
      const original = Client.create('John', 'john@doe.com', '12345678909', '123', 'Addr')

      original.updateName('Johnny')
      original.updateEmail('johnny@doe.com')
      original.updatePhone('456')
      original.updateAddress('New Addr')

      expect(original.id).toBe(original.id)
      expect(original.createdAt).toEqual(original.createdAt)
      expect(original.updatedAt.getTime()).toBeGreaterThanOrEqual(original.updatedAt.getTime())
      expect(original.name).toBe('Johnny')
      expect(original.getNormalizedEmail()).toBe('johnny@doe.com')
      expect(original.phone).toBe('456')
      expect(original.address).toBe('New Addr')
      expect(original.cpfCnpj).toBe(original.cpfCnpj)
    })

    it('should keep original values when parameters are undefined', () => {
      const original = Client.create('John', 'john@doe.com', '12345678909', '123', 'Addr')
      const originalName = original.name
      const originalEmail = original.getNormalizedEmail()
      const originalPhone = original.phone
      const originalAddress = original.address

      original.updateName(originalName)
      original.updateEmail(originalEmail)
      original.updatePhone(originalPhone)
      original.updateAddress(originalAddress)

      expect(original.name).toBe(originalName)
      expect(original.getNormalizedEmail()).toBe(originalEmail)
      expect(original.phone).toBe(originalPhone)
      expect(original.address).toBe(originalAddress)
      expect(original.cpfCnpj).toBe(original.cpfCnpj)
    })
  })

  describe('helpers', () => {
    it('hasPhone should return false for empty or whitespace', () => {
      const clientEmpty = new Client(
        'id-1',
        'A',
        { normalized: 'a@b.com' } as any,
        { formatted: '123.456.789-09' } as any,
        '',
        undefined,
      )
      expect(clientEmpty.hasPhone()).toBe(false)

      const clientWs = new Client(
        'id-2',
        'A',
        { normalized: 'a@b.com' } as any,
        { formatted: '123.456.789-09' } as any,
        '   ',
        undefined,
      )
      expect(clientWs.hasPhone()).toBe(false)
    })

    it('hasAddress should return false for empty or whitespace', () => {
      const clientEmpty = new Client(
        'id-1',
        'A',
        { normalized: 'a@b.com' } as any,
        { formatted: '123.456.789-09' } as any,
        undefined,
        '',
      )
      expect(clientEmpty.hasAddress()).toBe(false)

      const clientWs = new Client(
        'id-2',
        'A',
        { normalized: 'a@b.com' } as any,
        { formatted: '123.456.789-09' } as any,
        undefined,
        '   ',
      )
      expect(clientWs.hasAddress()).toBe(false)
    })
  })
})

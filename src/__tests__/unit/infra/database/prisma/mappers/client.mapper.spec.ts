import { Client as PrismaClient } from '@prisma/client'

import { Client } from '@domain/clients/entities'
import { CpfCnpj } from '@domain/clients/value-objects'
import { ClientMapper } from '@infra/database/prisma/mappers'
import { Email } from '@shared'

describe('ClientMapper', () => {
  const mockPrismaClient: PrismaClient = {
    id: 'client-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    cpfCnpj: '111.444.777-35',
    phone: '+55 11 99999-9999',
    address: '123 Main St, City',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  const mockDomainClient = new Client(
    'client-123',
    'John Doe',
    Email.create('john.doe@example.com'),
    CpfCnpj.create('111.444.777-35'),
    '+55 11 99999-9999',
    '123 Main St, City',
    new Date('2023-01-01'),
    new Date('2023-01-02'),
  )

  describe('toDomain', () => {
    it('should convert Prisma Client to domain entity', () => {
      const result = ClientMapper.toDomain(mockPrismaClient)

      expect(result).toBeInstanceOf(Client)
      expect(result.id).toBe('client-123')
      expect(result.name).toBe('John Doe')
      expect(result.email.value).toBe('john.doe@example.com')
      expect(result.cpfCnpj.value).toBe('111.444.777-35')
      expect(result.phone).toBe('+55 11 99999-9999')
      expect(result.address).toBe('123 Main St, City')
    })

    it('should handle null optional fields', () => {
      const prismaClientWithNulls = {
        ...mockPrismaClient,
        phone: null,
        address: null,
      }

      const result = ClientMapper.toDomain(prismaClientWithNulls)

      expect(result.phone).toBeUndefined()
      expect(result.address).toBeUndefined()
    })

    it('should throw error when Prisma Client is null', () => {
      expect(() => ClientMapper.toDomain(null as any)).toThrow(
        'Prisma Client model cannot be null or undefined',
      )
    })

    it('should throw error when Prisma Client is undefined', () => {
      expect(() => ClientMapper.toDomain(undefined as any)).toThrow(
        'Prisma Client model cannot be null or undefined',
      )
    })
  })

  describe('toDomainMany', () => {
    it('should convert array of Prisma Clients to domain entities', () => {
      const prismaClients = [mockPrismaClient, { ...mockPrismaClient, id: 'client-456' }]

      const result = ClientMapper.toDomainMany(prismaClients)

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Client)
      expect(result[1]).toBeInstanceOf(Client)
      expect(result[0].id).toBe('client-123')
      expect(result[1].id).toBe('client-456')
    })

    it('should filter out null and undefined values', () => {
      const prismaClients = [
        mockPrismaClient,
        null,
        undefined,
        { ...mockPrismaClient, id: 'client-456' },
      ] as any

      const result = ClientMapper.toDomainMany(prismaClients)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('client-123')
      expect(result[1].id).toBe('client-456')
    })

    it('should return empty array when input is not an array', () => {
      expect(ClientMapper.toDomainMany(null as any)).toEqual([])
      expect(ClientMapper.toDomainMany(undefined as any)).toEqual([])
      expect(ClientMapper.toDomainMany('not-an-array' as any)).toEqual([])
    })

    it('should return empty array for empty input', () => {
      expect(ClientMapper.toDomainMany([])).toEqual([])
    })
  })

  describe('toPrismaCreate', () => {
    it('should convert domain entity to Prisma create data', () => {
      const result = ClientMapper.toPrismaCreate(mockDomainClient)

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpfCnpj: '11144477735',
        phone: '+55 11 99999-9999',
        address: '123 Main St, City',
      })
    })

    it('should handle undefined optional fields', () => {
      const clientWithoutOptionals = new Client(
        'client-123',
        'John Doe',
        Email.create('john.doe@example.com'),
        CpfCnpj.create('111.444.777-35'),
        undefined,
        undefined,
        new Date('2023-01-01'),
        new Date('2023-01-02'),
      )

      const result = ClientMapper.toPrismaCreate(clientWithoutOptionals)

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpfCnpj: '11144477735',
        phone: null,
        address: null,
      })
    })

    it('should throw error when domain entity is null', () => {
      expect(() => ClientMapper.toPrismaCreate(null as any)).toThrow(
        'Client domain entity cannot be null or undefined',
      )
    })

    it('should throw error when domain entity is undefined', () => {
      expect(() => ClientMapper.toPrismaCreate(undefined as any)).toThrow(
        'Client domain entity cannot be null or undefined',
      )
    })
  })

  describe('toPrismaUpdate', () => {
    it('should convert domain entity to Prisma update data', () => {
      const result = ClientMapper.toPrismaUpdate(mockDomainClient)

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpfCnpj: '11144477735',
        phone: '+55 11 99999-9999',
        address: '123 Main St, City',
        updatedAt: expect.any(Date),
      })
    })

    it('should handle undefined optional fields', () => {
      const clientWithoutOptionals = new Client(
        'client-123',
        'John Doe',
        Email.create('john.doe@example.com'),
        CpfCnpj.create('111.444.777-35'),
        undefined,
        undefined,
        new Date('2023-01-01'),
        new Date('2023-01-02'),
      )

      const result = ClientMapper.toPrismaUpdate(clientWithoutOptionals)

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpfCnpj: '11144477735',
        phone: null,
        address: null,
        updatedAt: expect.any(Date),
      })
    })

    it('should throw error when domain entity is null', () => {
      expect(() => ClientMapper.toPrismaUpdate(null as any)).toThrow(
        'Client domain entity cannot be null or undefined',
      )
    })

    it('should throw error when domain entity is undefined', () => {
      expect(() => ClientMapper.toPrismaUpdate(undefined as any)).toThrow(
        'Client domain entity cannot be null or undefined',
      )
    })
  })
})

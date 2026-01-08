import { Service as PrismaService } from '@prisma/client'

import { Service } from '@domain/services/entities'
import { Price, EstimatedDuration } from '@domain/services/value-objects'
import { ServiceMapper } from '@infra/database/prisma/mappers'

describe('ServiceMapper', () => {
  const prismaServiceMock: PrismaService = {
    id: 'service-1',
    name: 'Serviço teste',
    price: 100000, // 1000 reais in cents
    description: 'Descrição teste',
    estimatedDuration: 50,
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-02T00:00:00Z'),
  }

  describe('toDomain', () => {
    it('should map PrismaService to Service domain entity', () => {
      const domainService = ServiceMapper.toDomain(prismaServiceMock)

      expect(domainService).toBeInstanceOf(Service)
      expect(domainService.id).toBe(prismaServiceMock.id)
      expect(domainService.name).toBe(prismaServiceMock.name)
      expect(domainService.description).toBe(prismaServiceMock.description)
      expect(domainService.createdAt).toEqual(prismaServiceMock.createdAt)
      expect(domainService.updatedAt).toEqual(prismaServiceMock.updatedAt)
      expect(domainService.price).toBeInstanceOf(Price)
      expect(domainService.estimatedDuration).toBeInstanceOf(EstimatedDuration)
      expect(domainService.price.getValue()).toBe(prismaServiceMock.price) // Should be the same cents value
      expect(domainService.price.getReaisValue()).toBe(1000) // Should be 1000 reais
      expect(domainService.price.getFormatted()).toBe('R$\u00A01.000,00') // Should be formatted correctly
      expect(domainService.estimatedDuration.getValue()).toBe(
        Number(prismaServiceMock.estimatedDuration),
      )
    })

    it('should map description null/undefined to empty string', () => {
      const prismaServiceWithNoDescription = { ...prismaServiceMock, description: null }

      const domain = ServiceMapper.toDomain(prismaServiceWithNoDescription as any)

      expect(domain.description).toBe('')
    })

    it('should throw error if prismaService is null or undefined', () => {
      expect(() => ServiceMapper.toDomain(null as any)).toThrow()
      expect(() => ServiceMapper.toDomain(undefined as any)).toThrow()
    })
  })

  describe('toDomainMany', () => {
    it('should map array of PrismaService to array of Service domain entities', () => {
      const prismaServices = [prismaServiceMock, { ...prismaServiceMock, id: 'service-2' }]
      const domainServices = ServiceMapper.toDomainMany(prismaServices)

      expect(domainServices).toHaveLength(2)
      expect(domainServices[0]).toBeInstanceOf(Service)
      expect(domainServices[1]).toBeInstanceOf(Service)
      expect(domainServices[0].id).toBe('service-1')
      expect(domainServices[1].id).toBe('service-2')
    })

    it('should filter out null/undefined entries when mapping many', () => {
      const prismaServices = [
        prismaServiceMock,
        null,
        undefined,
        { ...prismaServiceMock, id: 'service-3' },
      ]
      const domainServices = ServiceMapper.toDomainMany(prismaServices as any)

      expect(domainServices).toHaveLength(2)
      expect(domainServices.every((d) => d instanceof Service)).toBe(true)
    })

    it('should return empty array for null or undefined input', () => {
      expect(ServiceMapper.toDomainMany(null as any)).toEqual([])
      expect(ServiceMapper.toDomainMany(undefined as any)).toEqual([])
    })
  })

  describe('toPrismaCreate', () => {
    it('should map Service domain entity to Prisma create input', () => {
      const domainService = ServiceMapper.toDomain(prismaServiceMock)
      const prismaCreateInput = ServiceMapper.toPrismaCreate(domainService)

      expect(prismaCreateInput.name).toBe(domainService.name)
      expect(prismaCreateInput.description).toBe(domainService.description)
      expect(prismaCreateInput.price).toBe(domainService.price.getValue()) // Should be cents
      expect(prismaCreateInput.estimatedDuration).toBe(domainService.estimatedDuration.getValue())
    })

    it('should throw error if service is null or undefined', () => {
      expect(() => ServiceMapper.toPrismaCreate(null as any)).toThrow()
      expect(() => ServiceMapper.toPrismaCreate(undefined as any)).toThrow()
    })

    it('should map empty description to empty string on create input', () => {
      const prismaServiceWithNoDescription = { ...prismaServiceMock, description: null }
      const domainService = ServiceMapper.toDomain(prismaServiceWithNoDescription as any)

      const prismaCreateInput = ServiceMapper.toPrismaCreate(domainService)

      expect(prismaCreateInput.description).toBe('')
    })
  })

  describe('toPrismaUpdate', () => {
    it('should map Service domain entity to Prisma update input', () => {
      const domainService = ServiceMapper.toDomain(prismaServiceMock)
      const prismaUpdateInput = ServiceMapper.toPrismaUpdate(domainService)

      expect(prismaUpdateInput.id).toBe(domainService.id)
      expect(prismaUpdateInput.name).toBe(domainService.name)
      expect(prismaUpdateInput.description).toBe(domainService.description)
      expect(prismaUpdateInput.price).toBe(domainService.price.getValue()) // Should be cents
      expect(prismaUpdateInput.estimatedDuration).toBe(domainService.estimatedDuration.getValue())
      expect(prismaUpdateInput.updatedAt).toEqual(domainService.updatedAt)
    })

    it('should throw error if service is null or undefined', () => {
      expect(() => ServiceMapper.toPrismaUpdate(null as any)).toThrow()
      expect(() => ServiceMapper.toPrismaUpdate(undefined as any)).toThrow()
    })

    it('should map empty description to empty string on update input', () => {
      const prismaServiceWithNoDescription = { ...prismaServiceMock, description: null }
      const domainService = ServiceMapper.toDomain(prismaServiceWithNoDescription as any)

      const prismaUpdateInput = ServiceMapper.toPrismaUpdate(domainService)

      expect(prismaUpdateInput.description).toBe('')
    })
  })
})

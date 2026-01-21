import { ServiceOrder as PrismaServiceOrder, ServiceOrderStatus } from '@prisma/client'

import { ServiceOrderFactory } from '@/__tests__/factories'
import { ServiceOrder } from '@domain/service-orders/entities'
import { ServiceOrderMapper } from '@infra/database/prisma/mappers'

describe('ServiceOrderMapper', () => {
  const mockPrismaServiceOrder: PrismaServiceOrder = {
    id: 'so-123',
    status: ServiceOrderStatus.REQUESTED,
    requestDate: new Date('2023-01-01'),
    deliveryDate: null,
    cancellationReason: null,
    notes: null,
    clientId: 'client-123',
    vehicleId: 'vehicle-456',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  const mockDomainServiceOrder = ServiceOrderFactory.create({
    id: 'so-123',
    status: ServiceOrderStatus.REQUESTED,
    requestDate: new Date('2023-01-01'),
    deliveryDate: undefined,
    cancellationReason: undefined,
    notes: undefined,
    clientId: 'client-123',
    vehicleId: 'vehicle-456',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  })

  describe('toDomain', () => {
    it('should convert Prisma ServiceOrder to domain entity', () => {
      const result = ServiceOrderMapper.toDomain(mockPrismaServiceOrder)

      expect(result).toBeInstanceOf(ServiceOrder)
      expect(result.id).toBe('so-123')
      expect(result.status).toBe(ServiceOrderStatus.REQUESTED)
      expect(result.requestDate).toEqual(new Date('2023-01-01'))
      expect(result.deliveryDate).toBeUndefined()
      expect(result.cancellationReason).toBeUndefined()
      expect(result.notes).toBeUndefined()
      expect(result.clientId).toBe('client-123')
      expect(result.vehicleId).toBe('vehicle-456')
    })

    it('should handle optional fields with values', () => {
      const prismaServiceOrderWithOptionals = {
        ...mockPrismaServiceOrder,
        deliveryDate: new Date('2023-01-15'),
        cancellationReason: 'Customer requested cancellation',
        notes: 'Special instructions for repair',
      }

      const result = ServiceOrderMapper.toDomain(prismaServiceOrderWithOptionals)

      expect(result.deliveryDate).toEqual(new Date('2023-01-15'))
      expect(result.cancellationReason).toBe('Customer requested cancellation')
      expect(result.notes).toBe('Special instructions for repair')
    })

    it('should throw error when Prisma ServiceOrder is null', () => {
      expect(() => ServiceOrderMapper.toDomain(null as any)).toThrow(
        'Prisma ServiceOrder model cannot be null or undefined',
      )
    })

    it('should throw error when Prisma ServiceOrder is undefined', () => {
      expect(() => ServiceOrderMapper.toDomain(undefined as any)).toThrow(
        'Prisma ServiceOrder model cannot be null or undefined',
      )
    })
  })

  describe('toDomainMany', () => {
    it('should convert array of Prisma ServiceOrders to domain entities', () => {
      const prismaServiceOrders = [
        mockPrismaServiceOrder,
        { ...mockPrismaServiceOrder, id: 'so-456', status: ServiceOrderStatus.IN_EXECUTION },
      ]

      const result = ServiceOrderMapper.toDomainMany(prismaServiceOrders)

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(ServiceOrder)
      expect(result[1]).toBeInstanceOf(ServiceOrder)
      expect(result[0].id).toBe('so-123')
      expect(result[1].id).toBe('so-456')
      expect(result[0].status).toBe(ServiceOrderStatus.REQUESTED)
      expect(result[1].status).toBe(ServiceOrderStatus.IN_EXECUTION)
    })

    it('should filter out null and undefined values', () => {
      const prismaServiceOrders = [
        mockPrismaServiceOrder,
        null,
        undefined,
        { ...mockPrismaServiceOrder, id: 'so-456' },
      ] as any

      const result = ServiceOrderMapper.toDomainMany(prismaServiceOrders)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('so-123')
      expect(result[1].id).toBe('so-456')
    })

    it('should return empty array when input is not an array', () => {
      expect(ServiceOrderMapper.toDomainMany(null as any)).toEqual([])
      expect(ServiceOrderMapper.toDomainMany(undefined as any)).toEqual([])
      expect(ServiceOrderMapper.toDomainMany('not-an-array' as any)).toEqual([])
    })

    it('should return empty array for empty input', () => {
      expect(ServiceOrderMapper.toDomainMany([])).toEqual([])
    })
  })

  describe('toPrismaCreate', () => {
    it('should convert domain entity to Prisma create data', () => {
      const result = ServiceOrderMapper.toPrismaCreate(mockDomainServiceOrder)

      expect(result).toEqual({
        status: ServiceOrderStatus.REQUESTED,
        requestDate: new Date('2023-01-01'),
        deliveryDate: undefined,
        cancellationReason: undefined,
        notes: undefined,
        clientId: 'client-123',
        vehicleId: 'vehicle-456',
      })
    })

    it('should handle optional fields with values', () => {
      const serviceOrderWithOptionals = ServiceOrderFactory.create({
        id: 'so-123',
        deliveryDate: new Date('2023-01-15'),
        cancellationReason: 'Customer requested cancellation',
        notes: 'Special instructions for repair',
      })

      const result = ServiceOrderMapper.toPrismaCreate(serviceOrderWithOptionals)

      expect(result).toEqual({
        status: ServiceOrderStatus.REQUESTED,
        requestDate: expect.any(Date),
        deliveryDate: new Date('2023-01-15'),
        cancellationReason: 'Customer requested cancellation',
        notes: 'Special instructions for repair',
        clientId: 'client-123',
        vehicleId: 'vehicle-456',
      })
    })

    it('should throw error when domain entity is null', () => {
      expect(() => ServiceOrderMapper.toPrismaCreate(null as any)).toThrow(
        'ServiceOrder domain entity cannot be null or undefined',
      )
    })

    it('should throw error when domain entity is undefined', () => {
      expect(() => ServiceOrderMapper.toPrismaCreate(undefined as any)).toThrow(
        'ServiceOrder domain entity cannot be null or undefined',
      )
    })
  })

  describe('toPrismaUpdate', () => {
    it('should convert domain entity to Prisma update data', () => {
      const result = ServiceOrderMapper.toPrismaUpdate(mockDomainServiceOrder)

      expect(result).toEqual({
        status: ServiceOrderStatus.REQUESTED,
        deliveryDate: undefined,
        cancellationReason: undefined,
        notes: undefined,
        updatedAt: new Date('2023-01-02'),
      })
    })

    it('should handle optional fields with values', () => {
      const serviceOrderWithOptionals = ServiceOrderFactory.create({
        deliveryDate: new Date('2023-01-15'),
        cancellationReason: 'Customer requested cancellation',
        notes: 'Special instructions for repair',
      })

      const result = ServiceOrderMapper.toPrismaUpdate(serviceOrderWithOptionals)

      expect(result).toEqual({
        status: ServiceOrderStatus.REQUESTED,
        deliveryDate: new Date('2023-01-15'),
        cancellationReason: 'Customer requested cancellation',
        notes: 'Special instructions for repair',
        updatedAt: expect.any(Date),
      })
    })

    it('should throw error when domain entity is null', () => {
      expect(() => ServiceOrderMapper.toPrismaUpdate(null as any)).toThrow(
        'ServiceOrder domain entity cannot be null or undefined',
      )
    })

    it('should throw error when domain entity is undefined', () => {
      expect(() => ServiceOrderMapper.toPrismaUpdate(undefined as any)).toThrow(
        'ServiceOrder domain entity cannot be null or undefined',
      )
    })
  })
})

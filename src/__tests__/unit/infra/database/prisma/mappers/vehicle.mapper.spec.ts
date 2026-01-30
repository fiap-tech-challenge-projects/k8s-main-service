import { Vehicle as PrismaVehicle } from '@prisma/client'

import { Vehicle } from '@domain/vehicles/entities'
import { LicensePlate, Vin } from '@domain/vehicles/value-objects'
import { VehicleMapper } from '@infra/database/prisma/mappers'

describe('VehicleMapper', () => {
  const mockPrismaVehicle: PrismaVehicle = {
    id: 'vehicle-123',
    licensePlate: 'ABC1234',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    clientId: 'client-123',
    vin: '1HGBH41JXMN109186',
    color: 'White',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  const mockDomainVehicle = new Vehicle(
    'vehicle-123',
    LicensePlate.create('ABC1234'),
    'Toyota',
    'Corolla',
    2020,
    'client-123',
    Vin.create('1HGBH41JXMN109186'),
    'White',
    new Date('2023-01-01'),
    new Date('2023-01-02'),
  )

  describe('toDomain', () => {
    it('should convert Prisma Vehicle to domain entity', () => {
      const result = VehicleMapper.toDomain(mockPrismaVehicle)

      expect(result).toBeInstanceOf(Vehicle)
      expect(result.id).toBe('vehicle-123')
      expect(result.licensePlate.value).toBe('ABC1234')
      expect(result.make).toBe('Toyota')
      expect(result.model).toBe('Corolla')
      expect(result.year).toBe(2020)
      expect(result.clientId).toBe('client-123')
      expect(result.vin?.value).toBe('1HGBH41JXMN109186')
      expect(result.color).toBe('White')
    })

    it('should handle null optional fields', () => {
      const prismaVehicleWithNulls = {
        ...mockPrismaVehicle,
        vin: null,
        color: null,
      }

      const result = VehicleMapper.toDomain(prismaVehicleWithNulls)

      expect(result.vin).toBeUndefined()
      expect(result.color).toBeUndefined()
    })

    it('should throw error when Prisma Vehicle is null', () => {
      expect(() => VehicleMapper.toDomain(null as any)).toThrow(
        'Prisma Vehicle model cannot be null or undefined',
      )
    })

    it('should throw error when Prisma Vehicle is undefined', () => {
      expect(() => VehicleMapper.toDomain(undefined as any)).toThrow(
        'Prisma Vehicle model cannot be null or undefined',
      )
    })
  })

  describe('toDomainMany', () => {
    it('should convert array of Prisma Vehicles to domain entities', () => {
      const prismaVehicles = [mockPrismaVehicle, { ...mockPrismaVehicle, id: 'vehicle-456' }]

      const result = VehicleMapper.toDomainMany(prismaVehicles)

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Vehicle)
      expect(result[1]).toBeInstanceOf(Vehicle)
      expect(result[0].id).toBe('vehicle-123')
      expect(result[1].id).toBe('vehicle-456')
    })

    it('should filter out null and undefined values', () => {
      const prismaVehicles = [
        mockPrismaVehicle,
        null,
        undefined,
        { ...mockPrismaVehicle, id: 'vehicle-456' },
      ] as any

      const result = VehicleMapper.toDomainMany(prismaVehicles)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('vehicle-123')
      expect(result[1].id).toBe('vehicle-456')
    })

    it('should return empty array when input is not an array', () => {
      expect(VehicleMapper.toDomainMany(null as any)).toEqual([])
      expect(VehicleMapper.toDomainMany(undefined as any)).toEqual([])
      expect(VehicleMapper.toDomainMany('not-an-array' as any)).toEqual([])
    })

    it('should return empty array for empty input', () => {
      expect(VehicleMapper.toDomainMany([])).toEqual([])
    })
  })

  describe('toPrismaCreate', () => {
    it('should convert domain entity to Prisma create data', () => {
      const result = VehicleMapper.toPrismaCreate(mockDomainVehicle)

      expect(result).toEqual({
        licensePlate: 'ABC1234',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        vin: '1HGBH41JXMN109186',
        color: 'White',
        clientId: 'client-123',
      })
    })

    it('should handle undefined optional fields', () => {
      const vehicleWithoutOptionals = new Vehicle(
        'vehicle-123',
        LicensePlate.create('ABC1234'),
        'Toyota',
        'Corolla',
        2020,
        'client-123',
        undefined,
        undefined,
        new Date('2023-01-01'),
        new Date('2023-01-02'),
      )

      const result = VehicleMapper.toPrismaCreate(vehicleWithoutOptionals)

      expect(result).toEqual({
        licensePlate: 'ABC1234',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        vin: null,
        color: null,
        clientId: 'client-123',
      })
    })

    it('should throw error when domain entity is null', () => {
      expect(() => VehicleMapper.toPrismaCreate(null as any)).toThrow(
        'Vehicle domain entity cannot be null or undefined',
      )
    })

    it('should throw error when domain entity is undefined', () => {
      expect(() => VehicleMapper.toPrismaCreate(undefined as any)).toThrow(
        'Vehicle domain entity cannot be null or undefined',
      )
    })
  })

  describe('toPrismaUpdate', () => {
    it('should convert domain entity to Prisma update data', () => {
      const result = VehicleMapper.toPrismaUpdate(mockDomainVehicle)

      expect(result).toEqual({
        licensePlate: 'ABC1234',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        vin: '1HGBH41JXMN109186',
        color: 'White',
        clientId: 'client-123',
        updatedAt: expect.any(Date),
      })
    })

    it('should handle undefined optional fields', () => {
      const vehicleWithoutOptionals = new Vehicle(
        'vehicle-123',
        LicensePlate.create('ABC1234'),
        'Toyota',
        'Corolla',
        2020,
        'client-123',
        undefined,
        undefined,
        new Date('2023-01-01'),
        new Date('2023-01-02'),
      )

      const result = VehicleMapper.toPrismaUpdate(vehicleWithoutOptionals)

      expect(result).toEqual({
        licensePlate: 'ABC1234',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        vin: null,
        color: null,
        clientId: 'client-123',
        updatedAt: expect.any(Date),
      })
    })

    it('should throw error when domain entity is null', () => {
      expect(() => VehicleMapper.toPrismaUpdate(null as any)).toThrow(
        'Vehicle domain entity cannot be null or undefined',
      )
    })

    it('should throw error when domain entity is undefined', () => {
      expect(() => VehicleMapper.toPrismaUpdate(undefined as any)).toThrow(
        'Vehicle domain entity cannot be null or undefined',
      )
    })
  })
})

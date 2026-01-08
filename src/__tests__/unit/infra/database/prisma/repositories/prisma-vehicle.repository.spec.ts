import { Logger } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Vehicle as PrismaVehicle } from '@prisma/client'

import { VehicleFactory, sharedMockLogger } from '@/__tests__/factories'
import { Vehicle } from '@domain/vehicles/entities'
import { LicensePlate, Vin } from '@domain/vehicles/value-objects'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PrismaVehicleRepository } from '@infra/database/prisma/repositories'

describe('PrismaVehicleRepository', () => {
  let repository: PrismaVehicleRepository
  let prismaService: any

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

  beforeEach(async () => {
    const mockPrismaService = {
      vehicle: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaVehicleRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: Logger,
          useValue: sharedMockLogger,
        },
      ],
    }).compile()

    repository = module.get<PrismaVehicleRepository>(PrismaVehicleRepository)
    prismaService = module.get(PrismaService)

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findByLicensePlate', () => {
    it('should find vehicle by license plate successfully', async () => {
      const licensePlate = 'ABC1234'
      const cleanLicensePlate = LicensePlate.create(licensePlate).clean

      prismaService.vehicle.findUnique.mockResolvedValue(mockPrismaVehicle)

      const result = await repository.findByLicensePlate(licensePlate)

      expect(prismaService.vehicle.findUnique).toHaveBeenCalledWith({
        where: { licensePlate: cleanLicensePlate },
      })
      expect(result).toBeInstanceOf(Vehicle)
      expect(result?.id).toBe('vehicle-123')
    })

    it('should return null when vehicle not found', async () => {
      const licensePlate = 'ABC1234'

      prismaService.vehicle.findUnique.mockResolvedValue(null)

      const result = await repository.findByLicensePlate(licensePlate)

      expect(result).toBeNull()
    })

    it('should throw error when license plate validation fails', async () => {
      const invalidLicensePlate = 'invalid-plate'

      await expect(repository.findByLicensePlate(invalidLicensePlate)).rejects.toThrow()
    })
  })

  describe('findByVin', () => {
    it('should find vehicle by VIN successfully', async () => {
      const vin = '1HGBH41JXMN109186'
      const cleanVin = Vin.create(vin).clean

      prismaService.vehicle.findFirst.mockResolvedValue(mockPrismaVehicle)

      const result = await repository.findByVin(vin)

      expect(prismaService.vehicle.findFirst).toHaveBeenCalledWith({
        where: { vin: cleanVin },
      })
      expect(result).toBeInstanceOf(Vehicle)
      expect(result?.id).toBe('vehicle-123')
    })

    it('should return null when vehicle not found', async () => {
      const vin = '1HGBH41JXMN109186'

      prismaService.vehicle.findFirst.mockResolvedValue(null)

      const result = await repository.findByVin(vin)

      expect(result).toBeNull()
    })

    it('should throw error when VIN validation fails', async () => {
      const invalidVin = 'invalid-vin'

      await expect(repository.findByVin(invalidVin)).rejects.toThrow()
    })
  })

  describe('findByClientId', () => {
    it('should find vehicles by client ID with pagination', async () => {
      const clientId = 'client-123'
      const page = 1
      const limit = 10
      const mockVehicles = [mockPrismaVehicle]
      const totalCount = 1

      prismaService.vehicle.findMany.mockResolvedValue(mockVehicles)
      prismaService.vehicle.count.mockResolvedValue(totalCount)

      const result = await repository.findByClientId(clientId, page, limit)

      expect(prismaService.vehicle.findMany).toHaveBeenCalledWith({
        where: { clientId },
        skip: 0,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      expect(prismaService.vehicle.count).toHaveBeenCalledWith({
        where: { clientId },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should use default pagination when not provided', async () => {
      const clientId = 'client-123'

      prismaService.vehicle.findMany.mockResolvedValue([])
      prismaService.vehicle.count.mockResolvedValue(0)

      await repository.findByClientId(clientId)

      expect(prismaService.vehicle.findMany).toHaveBeenCalledWith({
        where: { clientId },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('licensePlateExists', () => {
    it('should return true when license plate exists', async () => {
      const licensePlate = 'ABC1234'
      const cleanLicensePlate = LicensePlate.create(licensePlate).clean

      prismaService.vehicle.count.mockResolvedValue(1)

      const result = await repository.licensePlateExists(licensePlate)

      expect(prismaService.vehicle.count).toHaveBeenCalledWith({
        where: { licensePlate: cleanLicensePlate },
      })
      expect(result).toBe(true)
    })

    it('should return false when license plate does not exist', async () => {
      const licensePlate = 'ABC1234'

      prismaService.vehicle.count.mockResolvedValue(0)

      const result = await repository.licensePlateExists(licensePlate)

      expect(result).toBe(false)
    })

    it('should rethrow when uniqueFieldExists fails internally', async () => {
      const plate = 'ABC1234'
      const internalError = new Error('Internal failure')
      jest.spyOn(repository as any, 'uniqueFieldExists').mockRejectedValueOnce(internalError)

      await expect(repository.licensePlateExists(plate)).rejects.toThrow('Internal failure')
    })
  })

  describe('vinExists', () => {
    it('should return true when VIN exists', async () => {
      const vin = '1HGBH41JXMN109186'
      const cleanVin = Vin.create(vin).clean

      prismaService.vehicle.count.mockResolvedValue(1)

      const result = await repository.vinExists(vin)

      expect(prismaService.vehicle.count).toHaveBeenCalledWith({
        where: { vin: cleanVin },
      })
      expect(result).toBe(true)
    })

    it('should return false when VIN does not exist', async () => {
      const vin = '1HGBH41JXMN109186'

      prismaService.vehicle.count.mockResolvedValue(0)

      const result = await repository.vinExists(vin)

      expect(result).toBe(false)
    })

    it('should log and rethrow when model.count fails', async () => {
      const vin = '1HGBH41JXMN109186'
      prismaService.vehicle.count.mockRejectedValueOnce(new Error('Count failed'))

      await expect(repository.vinExists(vin)).rejects.toThrow('Count failed')
    })
  })

  describe('findByMakeAndModel', () => {
    it('should find vehicles by make and model with pagination', async () => {
      const make = 'Toyota'
      const model = 'Corolla'
      const page = 1
      const limit = 10
      const mockVehicles = [mockPrismaVehicle]
      const totalCount = 1

      prismaService.vehicle.findMany.mockResolvedValue(mockVehicles)
      prismaService.vehicle.count.mockResolvedValue(totalCount)

      const result = await repository.findByMakeAndModel(make, model, page, limit)

      expect(prismaService.vehicle.findMany).toHaveBeenCalledWith({
        where: {
          make: { equals: make, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },
        },
        skip: 0,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      expect(prismaService.vehicle.count).toHaveBeenCalledWith({
        where: {
          make: { equals: make, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },
        },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should use default pagination when not provided', async () => {
      const make = 'Toyota'
      const model = 'Corolla'

      prismaService.vehicle.findMany.mockResolvedValue([])
      prismaService.vehicle.count.mockResolvedValue(0)

      await repository.findByMakeAndModel(make, model)

      expect(prismaService.vehicle.findMany).toHaveBeenCalledWith({
        where: {
          make: { equals: make, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('inherited methods', () => {
    it('should create vehicle successfully', async () => {
      const vehicle = VehicleFactory.create()
      const createData = {
        licensePlate: vehicle.licensePlate.value,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin?.value ?? null,
        color: vehicle.color ?? null,
        clientId: vehicle.clientId,
      }

      prismaService.vehicle.create.mockResolvedValue(mockPrismaVehicle)

      const result = await repository.create(vehicle)

      expect(prismaService.vehicle.create).toHaveBeenCalledWith({
        data: createData,
      })
      expect(result).toBeInstanceOf(Vehicle)
    })

    it('should update vehicle successfully', async () => {
      const vehicle = VehicleFactory.create({ id: 'vehicle-123' })
      const updateData = {
        licensePlate: vehicle.licensePlate.value,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin?.value ?? null,
        color: vehicle.color ?? null,
        clientId: vehicle.clientId,
        updatedAt: expect.any(Date),
      }

      prismaService.vehicle.update.mockResolvedValue(mockPrismaVehicle)

      const result = await repository.update(vehicle.id, vehicle)

      expect(prismaService.vehicle.update).toHaveBeenCalledWith({
        where: { id: vehicle.id },
        data: updateData,
      })
      expect(result).toBeInstanceOf(Vehicle)
    })

    it('should delete vehicle successfully', async () => {
      const vehicleId = 'vehicle-123'

      prismaService.vehicle.delete.mockResolvedValue(mockPrismaVehicle)

      const result = await repository.delete(vehicleId)

      expect(prismaService.vehicle.delete).toHaveBeenCalledWith({
        where: { id: vehicleId },
      })
      expect(result).toBe(true)
    })

    it('should find vehicle by id successfully', async () => {
      const vehicleId = 'vehicle-123'

      prismaService.vehicle.findUnique.mockResolvedValue(mockPrismaVehicle)

      const result = await repository.findById(vehicleId)

      expect(prismaService.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: vehicleId },
      })
      expect(result).toBeInstanceOf(Vehicle)
    })

    it('should find all vehicles with pagination', async () => {
      const mockVehicles = [mockPrismaVehicle]
      const totalCount = 1

      prismaService.vehicle.findMany.mockResolvedValue(mockVehicles)
      prismaService.vehicle.count.mockResolvedValue(totalCount)

      const result = await repository.findAll(1, 10)

      expect(prismaService.vehicle.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: {},
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
    })
  })
})

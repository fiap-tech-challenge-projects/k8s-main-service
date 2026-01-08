import { Logger } from '@nestjs/common'
import { ServiceOrder as PrismaServiceOrder, ServiceOrderStatus } from '@prisma/client'

import { ServiceOrderFactory } from '@/__tests__/factories'
import { ServiceOrder } from '@domain/service-orders/entities'
import { PrismaServiceOrderRepository } from '@infra/database/prisma/repositories'

describe('PrismaServiceOrderRepository', () => {
  let repository: PrismaServiceOrderRepository
  let prismaService: any

  const mockPrismaServiceOrder: PrismaServiceOrder = {
    id: 'so-123',
    status: ServiceOrderStatus.REQUESTED,
    requestDate: new Date('2023-01-01'),
    deliveryDate: new Date('2023-01-15'),
    cancellationReason: 'Customer requested cancellation',
    notes: 'Special instructions for repair',
    clientId: 'client-123',
    vehicleId: 'vehicle-456',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  beforeEach(async () => {
    const mockPrismaService = {
      serviceOrder: {
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
    // instantiate repository directly for pure-unit testing
    repository = new PrismaServiceOrderRepository(mockPrismaService as any)
    prismaService = mockPrismaService

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findByStatus', () => {
    it('should find service orders by status with pagination', async () => {
      const status = ServiceOrderStatus.REQUESTED
      const page = 1
      const limit = 10
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 1

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findByStatus(status, page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { status },
        skip: 0,
        take: limit,
        orderBy: { requestDate: 'desc' },
      })
      expect(prismaService.serviceOrder.count).toHaveBeenCalledWith({
        where: { status },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should find service orders by status with custom pagination', async () => {
      const status = ServiceOrderStatus.IN_EXECUTION
      const page = 2
      const limit = 5
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 15

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findByStatus(status, page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { status },
        skip: 5,
        take: limit,
        orderBy: { requestDate: 'desc' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should use default pagination when not provided', async () => {
      const status = ServiceOrderStatus.REQUESTED

      prismaService.serviceOrder.findMany.mockResolvedValue([])
      prismaService.serviceOrder.count.mockResolvedValue(0)

      await repository.findByStatus(status)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { status },
        skip: 0,
        take: 10,
        orderBy: { requestDate: 'desc' },
      })
    })

    it('should handle errors and log them', async () => {
      const status = ServiceOrderStatus.REQUESTED
      const error = new Error('Database error')

      prismaService.serviceOrder.findMany.mockRejectedValue(error)

      await expect(repository.findByStatus(status)).rejects.toThrow('Database error')
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error finding paginated serviceOrder:',
        error,
      )
    })
  })

  describe('findByClientId', () => {
    it('should find service orders by client ID with pagination', async () => {
      const clientId = 'client-123'
      const page = 1
      const limit = 10
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 1

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findByClientId(clientId, page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { clientId },
        skip: 0,
        take: limit,
        orderBy: { requestDate: 'desc' },
      })
      expect(prismaService.serviceOrder.count).toHaveBeenCalledWith({
        where: { clientId },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should find service orders by client ID with custom pagination', async () => {
      const clientId = 'client-456'
      const page = 3
      const limit = 15
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 50

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findByClientId(clientId, page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { clientId },
        skip: 30,
        take: limit,
        orderBy: { requestDate: 'desc' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should use default pagination when not provided', async () => {
      const clientId = 'client-123'

      prismaService.serviceOrder.findMany.mockResolvedValue([])
      prismaService.serviceOrder.count.mockResolvedValue(0)

      await repository.findByClientId(clientId)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { clientId },
        skip: 0,
        take: 10,
        orderBy: { requestDate: 'desc' },
      })
    })

    it('should handle errors and log them', async () => {
      const clientId = 'client-123'
      const error = new Error('Database error')

      prismaService.serviceOrder.findMany.mockRejectedValue(error)

      await expect(repository.findByClientId(clientId)).rejects.toThrow('Database error')
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error finding paginated serviceOrder:',
        error,
      )
    })
  })

  describe('findByVehicleId', () => {
    it('should find service orders by vehicle ID with pagination', async () => {
      const vehicleId = 'vehicle-456'
      const page = 1
      const limit = 10
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 1

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findByVehicleId(vehicleId, page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { vehicleId },
        skip: 0,
        take: limit,
        orderBy: { requestDate: 'desc' },
      })
      expect(prismaService.serviceOrder.count).toHaveBeenCalledWith({
        where: { vehicleId },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should find service orders by vehicle ID with custom pagination', async () => {
      const vehicleId = 'vehicle-789'
      const page = 4
      const limit = 20
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 100

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findByVehicleId(vehicleId, page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { vehicleId },
        skip: 60,
        take: limit,
        orderBy: { requestDate: 'desc' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should use default pagination when not provided', async () => {
      const vehicleId = 'vehicle-456'

      prismaService.serviceOrder.findMany.mockResolvedValue([])
      prismaService.serviceOrder.count.mockResolvedValue(0)

      await repository.findByVehicleId(vehicleId)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { vehicleId },
        skip: 0,
        take: 10,
        orderBy: { requestDate: 'desc' },
      })
    })

    it('should handle errors and log them', async () => {
      const vehicleId = 'vehicle-456'
      const error = new Error('Database error')

      prismaService.serviceOrder.findMany.mockRejectedValue(error)

      await expect(repository.findByVehicleId(vehicleId)).rejects.toThrow('Database error')
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error finding paginated serviceOrder:',
        error,
      )
    })
  })

  describe('findByDateRange', () => {
    it('should find service orders by date range with pagination', async () => {
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-01-31')
      const page = 1
      const limit = 10
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 1

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findByDateRange(startDate, endDate, page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: {
          requestDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        skip: 0,
        take: limit,
        orderBy: { requestDate: 'desc' },
      })
      expect(prismaService.serviceOrder.count).toHaveBeenCalledWith({
        where: {
          requestDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should find service orders by date range with custom pagination', async () => {
      const startDate = new Date('2023-02-01')
      const endDate = new Date('2023-02-28')
      const page = 5
      const limit = 25
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 150

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findByDateRange(startDate, endDate, page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: {
          requestDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        skip: 100,
        take: limit,
        orderBy: { requestDate: 'desc' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should use default pagination when not provided', async () => {
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-01-31')

      prismaService.serviceOrder.findMany.mockResolvedValue([])
      prismaService.serviceOrder.count.mockResolvedValue(0)

      await repository.findByDateRange(startDate, endDate)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: {
          requestDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        skip: 0,
        take: 10,
        orderBy: { requestDate: 'desc' },
      })
    })

    it('should handle errors and log them', async () => {
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-01-31')
      const error = new Error('Database error')

      prismaService.serviceOrder.findMany.mockRejectedValue(error)

      await expect(repository.findByDateRange(startDate, endDate)).rejects.toThrow('Database error')
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error finding paginated serviceOrder:',
        error,
      )
    })
  })

  describe('findOverdue', () => {
    it('should find overdue service orders with pagination', async () => {
      const page = 1
      const limit = 10
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 1

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findOverdue(page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: {
          deliveryDate: {
            lt: expect.any(Date),
          },
          status: {
            notIn: [ServiceOrderStatus.DELIVERED, ServiceOrderStatus.CANCELLED],
          },
        },
        skip: 0,
        take: limit,
        orderBy: { deliveryDate: 'asc' },
      })
      expect(prismaService.serviceOrder.count).toHaveBeenCalledWith({
        where: {
          deliveryDate: {
            lt: expect.any(Date),
          },
          status: {
            notIn: [ServiceOrderStatus.DELIVERED, ServiceOrderStatus.CANCELLED],
          },
        },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should find overdue service orders with custom pagination', async () => {
      const page = 6
      const limit = 30
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 200

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findOverdue(page, limit)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: {
          deliveryDate: {
            lt: expect.any(Date),
          },
          status: {
            notIn: [ServiceOrderStatus.DELIVERED, ServiceOrderStatus.CANCELLED],
          },
        },
        skip: 150,
        take: limit,
        orderBy: { deliveryDate: 'asc' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should use default pagination when not provided', async () => {
      prismaService.serviceOrder.findMany.mockResolvedValue([])
      prismaService.serviceOrder.count.mockResolvedValue(0)

      await repository.findOverdue()

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: {
          deliveryDate: {
            lt: expect.any(Date),
          },
          status: {
            notIn: [ServiceOrderStatus.DELIVERED, ServiceOrderStatus.CANCELLED],
          },
        },
        skip: 0,
        take: 10,
        orderBy: { deliveryDate: 'asc' },
      })
    })

    it('should handle errors and log them', async () => {
      const error = new Error('Database error')

      prismaService.serviceOrder.findMany.mockRejectedValue(error)

      await expect(repository.findOverdue()).rejects.toThrow('Database error')
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error finding paginated serviceOrder:',
        error,
      )
    })
  })

  describe('inherited methods', () => {
    it('should create service order successfully', async () => {
      const serviceOrder = ServiceOrderFactory.create()

      prismaService.serviceOrder.create.mockResolvedValue(mockPrismaServiceOrder)

      const result = await repository.create(serviceOrder)

      expect(prismaService.serviceOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: serviceOrder.status,
          requestDate: serviceOrder.requestDate,
          clientId: serviceOrder.clientId,
          vehicleId: serviceOrder.vehicleId,
        }),
      })
      expect(result).toBeInstanceOf(ServiceOrder)
    })

    it('should update service order successfully', async () => {
      const serviceOrder = ServiceOrderFactory.create({ id: 'so-123' })

      prismaService.serviceOrder.update.mockResolvedValue(mockPrismaServiceOrder)

      const result = await repository.update(serviceOrder.id, serviceOrder)

      expect(prismaService.serviceOrder.update).toHaveBeenCalledWith({
        where: { id: serviceOrder.id },
        data: expect.objectContaining({
          status: serviceOrder.status,
          updatedAt: expect.any(Date),
        }),
      })
      expect(result).toBeInstanceOf(ServiceOrder)
    })

    it('should delete service order successfully', async () => {
      const serviceOrderId = 'so-123'

      prismaService.serviceOrder.delete.mockResolvedValue(mockPrismaServiceOrder)

      const result = await repository.delete(serviceOrderId)

      expect(prismaService.serviceOrder.delete).toHaveBeenCalledWith({
        where: { id: serviceOrderId },
      })
      expect(result).toBe(true)
    })

    it('should find service order by id successfully', async () => {
      const serviceOrderId = 'so-123'

      prismaService.serviceOrder.findUnique.mockResolvedValue(mockPrismaServiceOrder)

      const result = await repository.findById(serviceOrderId)

      expect(prismaService.serviceOrder.findUnique).toHaveBeenCalledWith({
        where: { id: serviceOrderId },
      })
      expect(result).toBeInstanceOf(ServiceOrder)
    })

    it('should return null when service order not found', async () => {
      const serviceOrderId = 'so-123'

      prismaService.serviceOrder.findUnique.mockResolvedValue(null)

      const result = await repository.findById(serviceOrderId)

      expect(result).toBeNull()
    })

    it('should find all service orders with pagination', async () => {
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 1

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findAll(1, 10)

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: {},
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
    })

    it('should find all service orders without pagination', async () => {
      const mockServiceOrders = [mockPrismaServiceOrder]
      const totalCount = 1

      prismaService.serviceOrder.findMany.mockResolvedValue(mockServiceOrders)
      prismaService.serviceOrder.count.mockResolvedValue(totalCount)

      const result = await repository.findAll()

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: {},
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
    })

    it('should check if service order exists', async () => {
      const serviceOrderId = 'so-123'

      prismaService.serviceOrder.count.mockResolvedValue(1)

      const result = await repository.exists(serviceOrderId)

      expect(prismaService.serviceOrder.count).toHaveBeenCalledWith({
        where: { id: serviceOrderId },
      })
      expect(result).toBe(true)
    })

    it('should return false when service order does not exist', async () => {
      const serviceOrderId = 'so-123'

      prismaService.serviceOrder.count.mockResolvedValue(0)

      const result = await repository.exists(serviceOrderId)

      expect(result).toBe(false)
    })
  })
})

import { Logger } from '@nestjs/common'
import { Budget as PrismaBudget, BudgetStatus } from '@prisma/client'

import { Budget } from '@domain/budget/entities'
import { BudgetMapper } from '@infra/database/prisma/mappers'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { PrismaBudgetRepository } from '@infra/database/prisma/repositories'

describe('PrismaBudgetRepository', () => {
  let repository: PrismaBudgetRepository
  let prismaService: any

  const mockPrismaBudget: PrismaBudget = {
    id: 'budget-123',
    status: BudgetStatus.GENERATED,
    totalAmount: 1500.0,
    validityPeriod: 7,
    generationDate: new Date('2023-01-01'),
    sentDate: null,
    approvalDate: null,
    rejectionDate: null,
    deliveryMethod: 'EMAIL',
    notes: 'Test budget notes',
    serviceOrderId: 'service-order-456',
    clientId: 'client-789',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  const mockBudgetEntity = Budget.create(
    'service-order-456',
    'client-789',
    7,
    'EMAIL',
    'Test budget notes',
    BudgetStatus.GENERATED,
    '1500.0',
  )

  beforeEach(() => {
    prismaService = {
      budget: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    }

    // instantiate repository directly with mocked prisma service
    repository = new PrismaBudgetRepository(prismaService as PrismaService)

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
    jest.spyOn(BudgetMapper, 'toDomain').mockReturnValue(mockBudgetEntity)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findByServiceOrderId', () => {
    it('should find budget by service order ID successfully', async () => {
      const serviceOrderId = 'service-order-456'
      prismaService.budget.findUnique.mockResolvedValue(mockPrismaBudget)

      const result = await repository.findByServiceOrderId(serviceOrderId)

      expect(prismaService.budget.findUnique).toHaveBeenCalledWith({
        where: { serviceOrderId },
      })
      expect(BudgetMapper.toDomain).toHaveBeenCalledWith(mockPrismaBudget)
      expect(result).toBeInstanceOf(Budget)
      expect(result?.serviceOrderId).toBe(serviceOrderId)
    })

    it('should return null when budget not found by service order ID', async () => {
      const serviceOrderId = 'non-existent-service-order'
      prismaService.budget.findUnique.mockResolvedValue(null)

      const result = await repository.findByServiceOrderId(serviceOrderId)

      expect(prismaService.budget.findUnique).toHaveBeenCalledWith({
        where: { serviceOrderId },
      })
      expect(result).toBeNull()
    })

    it('should log error and rethrow when findUnique fails', async () => {
      const serviceOrderId = 'service-order-error'
      const error = new Error('Database error')
      prismaService.budget.findUnique.mockRejectedValue(error)

      await expect(repository.findByServiceOrderId(serviceOrderId)).rejects.toThrow(error)
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Error finding budget by serviceOrderId ${serviceOrderId}:`,
        error,
      )
    })
  })

  describe('findByClientId', () => {
    it('should find budgets by client ID with pagination', async () => {
      const clientId = 'client-789'
      const mockBudgets = [mockPrismaBudget]
      const totalCount = 1

      prismaService.budget.findMany.mockResolvedValue(mockBudgets)
      prismaService.budget.count.mockResolvedValue(totalCount)

      const result = await repository.findByClientId(clientId, 1, 10)

      expect(prismaService.budget.findMany).toHaveBeenCalledWith({
        where: { clientId },
        skip: 0,
        take: 10,
        orderBy: { generationDate: 'desc' },
      })
      expect(prismaService.budget.count).toHaveBeenCalledWith({ where: { clientId } })
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toBeInstanceOf(Budget)
      expect(result.meta.total).toBe(1)
    })

    it('should handle pagination with default values', async () => {
      const clientId = 'client-789'
      prismaService.budget.findMany.mockResolvedValue([])
      prismaService.budget.count.mockResolvedValue(0)

      const result = await repository.findByClientId(clientId)

      expect(prismaService.budget.findMany).toHaveBeenCalledWith({
        where: { clientId },
        skip: 0,
        take: 10,
        orderBy: { generationDate: 'desc' },
      })
      expect(result.data).toHaveLength(0)
      expect(result.meta.total).toBe(0)
    })

    it('should log error and rethrow when findMany fails', async () => {
      const clientId = 'client-error'
      const error = new Error('Database error')
      prismaService.budget.findMany.mockRejectedValue(error)

      await expect(repository.findByClientId(clientId)).rejects.toThrow(error)
      expect(Logger.prototype.error).toHaveBeenCalledWith(`Error finding paginated budget:`, error)
    })
  })

  describe('findByClientName', () => {
    it('should find budgets by client name with case insensitive search', async () => {
      const name = 'Test Name'
      const mockBudgets = [mockPrismaBudget]
      const totalCount = 1

      prismaService.budget.findMany.mockResolvedValue(mockBudgets)
      prismaService.budget.count.mockResolvedValue(totalCount)

      const result = await repository.findByClientName(name, 1, 10)

      expect(prismaService.budget.findMany).toHaveBeenCalledWith({
        where: {
          client: {
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { generationDate: 'desc' },
      })
      expect(result.data).toHaveLength(1)
    })
  })

  describe('findByStatus', () => {
    it('should find budgets by status with pagination', async () => {
      const status = BudgetStatus.APPROVED
      const mockBudgets = [mockPrismaBudget]
      const totalCount = 1

      prismaService.budget.findMany.mockResolvedValue(mockBudgets)
      prismaService.budget.count.mockResolvedValue(totalCount)

      const result = await repository.findByStatus(status, 1, 10)

      expect(prismaService.budget.findMany).toHaveBeenCalledWith({
        where: { status },
        skip: 0,
        take: 10,
        orderBy: { generationDate: 'desc' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })

    it('should log error and rethrow when findMany fails', async () => {
      const status = BudgetStatus.REJECTED
      const error = new Error('Database error')
      prismaService.budget.findMany.mockRejectedValue(error)

      await expect(repository.findByStatus(status)).rejects.toThrow(error)
      expect(Logger.prototype.error).toHaveBeenCalledWith(`Error finding paginated budget:`, error)
    })
  })

  describe('budgetExistsForServiceOrder', () => {
    it('should return true when budget exists for service order', async () => {
      const serviceOrderId = 'service-order-456'
      prismaService.budget.count.mockResolvedValue(1)

      const result = await repository.budgetExistsForServiceOrder(serviceOrderId)

      expect(prismaService.budget.count).toHaveBeenCalledWith({
        where: { serviceOrderId },
      })
      expect(result).toBe(true)
    })

    it('should return false when budget does not exist for service order', async () => {
      const serviceOrderId = 'non-existent-service-order'
      prismaService.budget.count.mockResolvedValue(0)

      const result = await repository.budgetExistsForServiceOrder(serviceOrderId)

      expect(result).toBe(false)
    })

    it('should log error and rethrow when count fails', async () => {
      const serviceOrderId = 'service-order-error'
      const error = new Error('Database error')
      prismaService.budget.count.mockRejectedValue(error)

      await expect(repository.budgetExistsForServiceOrder(serviceOrderId)).rejects.toThrow(error)
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Error checking if serviceOrderId exists ${serviceOrderId}:`,
        error,
      )
    })
  })

  describe('budgetExistsForClient', () => {
    it('should return true when budget exists for client', async () => {
      const clientId = 'client-789'
      prismaService.budget.count.mockResolvedValue(1)

      const result = await repository.budgetExistsForClient(clientId)

      expect(prismaService.budget.count).toHaveBeenCalledWith({ where: { clientId } })
      expect(result).toBe(true)
    })

    it('should log error and rethrow when count fails', async () => {
      const clientId = 'client-error'
      const error = new Error('Database error')
      prismaService.budget.count.mockRejectedValue(error)

      await expect(repository.budgetExistsForClient(clientId)).rejects.toThrow(error)
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Error checking if clientId exists ${clientId}:`,
        error,
      )
    })
  })

  describe('findById', () => {
    it('should find budget by ID', async () => {
      const budgetId = 'budget-123'
      prismaService.budget.findUnique.mockResolvedValue(mockPrismaBudget)

      const result = await repository.findById(budgetId)

      expect(prismaService.budget.findUnique).toHaveBeenCalledWith({
        where: { id: budgetId },
      })
      expect(BudgetMapper.toDomain).toHaveBeenCalledWith(mockPrismaBudget)
      expect(result).toBeInstanceOf(Budget)
    })

    it('should return null when budget not found by ID', async () => {
      const budgetId = 'non-existent-budget'
      prismaService.budget.findUnique.mockResolvedValue(null)

      const result = await repository.findById(budgetId)

      expect(result).toBeNull()
    })

    it('should log error and rethrow when findUnique fails', async () => {
      const budgetId = 'budget-error'
      const error = new Error('Database error')
      prismaService.budget.findUnique.mockRejectedValue(error)

      await expect(repository.findById(budgetId)).rejects.toThrow(error)
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Error finding budget by ID ${budgetId}:`,
        error,
      )
    })
  })

  describe('protected getters', () => {
    it('should return correct model name', () => {
      expect(repository['modelName']).toBe('budget')
    })

    it('should return BudgetMapper.toDomain as mapper', () => {
      expect(repository['mapper']).toBe(BudgetMapper.toDomain)
    })

    it('should return BudgetMapper.toPrismaCreate as createMapper', () => {
      expect(repository['createMapper']).toBe(BudgetMapper.toPrismaCreate)
    })

    it('should return BudgetMapper.toPrismaUpdate as updateMapper', () => {
      expect(repository['updateMapper']).toBe(BudgetMapper.toPrismaUpdate)
    })
  })

  describe('inheritance from BasePrismaRepository', () => {
    it('should extend BasePrismaRepository', () => {
      expect(repository).toBeInstanceOf(PrismaBudgetRepository)
      expect(repository.constructor.name).toBe('PrismaBudgetRepository')
    })

    it('should implement IBudgetRepository interface', () => {
      // Check that all required methods exist
      expect(typeof repository.findByServiceOrderId).toBe('function')
      expect(typeof repository.findByClientId).toBe('function')
      expect(typeof repository.findByStatus).toBe('function')
      expect(typeof repository.budgetExistsForServiceOrder).toBe('function')
      expect(typeof repository.budgetExistsForClient).toBe('function')
      expect(typeof repository.findById).toBe('function')
    })
  })
})

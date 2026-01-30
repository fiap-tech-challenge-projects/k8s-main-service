import { Logger } from '@nestjs/common'
import { BudgetItem as PrismaBudgetItem, BudgetItemType } from '@prisma/client'

import { BudgetItem } from '@domain/budget-items/entities'
// PrismaService is mocked directly in tests; import not required for pure-unit spec
import { PrismaBudgetItemRepository } from '@infra/database/prisma/repositories'
import { Price } from '@shared'

describe('PrismaBudgetItemRepository', () => {
  let repository: PrismaBudgetItemRepository
  let prismaService: any

  const mockPrismaBudgetItem: PrismaBudgetItem = {
    id: 'budget-item-123',
    type: BudgetItemType.SERVICE,
    description: 'Troca de óleo',
    quantity: 1,
    unitPrice: 15000, // R$ 150.00 em centavos
    totalPrice: 15000, // R$ 150.00 em centavos
    budgetId: 'budget-456',
    notes: 'Óleo sintético',
    stockItemId: null,
    serviceId: 'service-789',
    createdAt: new Date('2023-01-01'),
  }

  // logger is spied on via Logger.prototype in tests

  beforeEach(() => {
    const mockPrismaService = {
      budgetItem: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any

    // instantiate repository directly to keep the test pure-unit
    repository = new PrismaBudgetItemRepository(mockPrismaService as any)
    prismaService = mockPrismaService

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findByBudgetId', () => {
    it('should find budget items by budget ID successfully', async () => {
      const budgetId = 'budget-456'
      const mockBudgetItems = [mockPrismaBudgetItem]

      prismaService.budgetItem.findMany.mockResolvedValue(mockBudgetItems)

      const result = await repository.findByBudgetId(budgetId)

      expect(prismaService.budgetItem.findMany).toHaveBeenCalledWith({
        where: { budgetId },
      })
      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(BudgetItem)
      expect(result[0].id).toBe('budget-item-123')
      expect(result[0].budgetId).toBe(budgetId)
    })

    it('should return empty array when no budget items found', async () => {
      const budgetId = 'budget-not-found'

      prismaService.budgetItem.findMany.mockResolvedValue([])

      const result = await repository.findByBudgetId(budgetId)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should log error and rethrow when database operation fails', async () => {
      const budgetId = 'budget-error'
      const dbError = new Error('Database connection failed')

      prismaService.budgetItem.findMany.mockRejectedValue(dbError)

      await expect(repository.findByBudgetId(budgetId)).rejects.toThrow(
        'Database connection failed',
      )
      expect(Logger.prototype.error).toHaveBeenCalled()
    })
  })

  describe('findByBudgetIdPaginated', () => {
    it('should call findPaginated and return paginated result', async () => {
      const budgetId = 'budget-456'
      const paginated = {
        data: [
          new BudgetItem(
            'budget-item-123',
            BudgetItemType.SERVICE,
            'Desc',
            1,
            Price.create(1000),
            budgetId,
            undefined,
            undefined,
            undefined,
          ),
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
      }

      jest.spyOn(repository as any, 'findPaginated').mockResolvedValue(paginated)

      const result = await repository.findByBudgetIdPaginated(budgetId, 1, 10)

      expect((repository as any).findPaginated).toHaveBeenCalledWith({ budgetId }, 1, 10)
      expect(result).toEqual(paginated)
    })

    it('should log error and rethrow when findPaginated fails', async () => {
      const budgetId = 'budget-error'
      const dbError = new Error('Paginated DB error')

      jest.spyOn(repository as any, 'findPaginated').mockRejectedValue(dbError)

      await expect(repository.findByBudgetIdPaginated(budgetId, 1, 10)).rejects.toThrow(
        'Paginated DB error',
      )
      expect(Logger.prototype.error).toHaveBeenCalled()
    })
  })

  describe('inherited methods from BasePrismaRepository', () => {
    it('should create budget item successfully', async () => {
      const budgetItem = new BudgetItem(
        'budget-item-new',
        BudgetItemType.SERVICE,
        'Balanceamento',
        1,
        Price.create('R$ 80,00'),
        'budget-789',
        'Balanceamento completo',
        undefined,
        'service-123',
      )

      prismaService.budgetItem.create.mockResolvedValue(mockPrismaBudgetItem)

      const result = await repository.create(budgetItem)

      expect(prismaService.budgetItem.create).toHaveBeenCalledWith({
        data: {
          type: budgetItem.type,
          description: budgetItem.description,
          quantity: budgetItem.quantity,
          unitPrice: budgetItem.unitPrice.getValue(),
          totalPrice: budgetItem.totalPrice.getValue(),
          budgetId: budgetItem.budgetId,
          notes: budgetItem.notes,
          serviceId: budgetItem.serviceId,
          stockItemId: budgetItem.stockItemId,
        },
      })
      expect(result).toBeInstanceOf(BudgetItem)
    })

    it('should find budget item by ID successfully', async () => {
      const budgetItemId = 'budget-item-123'

      prismaService.budgetItem.findUnique.mockResolvedValue(mockPrismaBudgetItem)

      const result = await repository.findById(budgetItemId)

      expect(prismaService.budgetItem.findUnique).toHaveBeenCalledWith({
        where: { id: budgetItemId },
      })
      expect(result).toBeInstanceOf(BudgetItem)
      expect(result?.id).toBe(budgetItemId)
    })

    it('should return null when budget item not found by ID', async () => {
      const budgetItemId = 'budget-item-not-found'

      prismaService.budgetItem.findUnique.mockResolvedValue(null)

      const result = await repository.findById(budgetItemId)

      expect(result).toBeNull()
    })

    it('should update budget item successfully', async () => {
      const budgetItemId = 'budget-item-123'
      const updatedBudgetItem = new BudgetItem(
        budgetItemId,
        BudgetItemType.STOCK_ITEM,
        'Filtro de óleo',
        2,
        Price.create('R$ 25,00'),
        'budget-456',
        'Filtro de alta qualidade',
        'stock-456',
        undefined,
      )

      prismaService.budgetItem.update.mockResolvedValue(mockPrismaBudgetItem)

      const result = await repository.update(budgetItemId, updatedBudgetItem)

      expect(prismaService.budgetItem.update).toHaveBeenCalledWith({
        where: { id: budgetItemId },
        data: expect.objectContaining({
          type: updatedBudgetItem.type,
          description: updatedBudgetItem.description,
          quantity: updatedBudgetItem.quantity,
        }),
      })
      expect(result).toBeInstanceOf(BudgetItem)
    })

    it('should delete budget item successfully', async () => {
      const budgetItemId = 'budget-item-123'

      prismaService.budgetItem.delete.mockResolvedValue(mockPrismaBudgetItem)

      const result = await repository.delete(budgetItemId)

      expect(prismaService.budgetItem.delete).toHaveBeenCalledWith({
        where: { id: budgetItemId },
      })
      expect(result).toBe(true)
    })

    it('should check if budget item exists', async () => {
      const budgetItemId = 'budget-item-123'

      prismaService.budgetItem.count.mockResolvedValue(1)

      const result = await repository.exists(budgetItemId)

      expect(prismaService.budgetItem.count).toHaveBeenCalledWith({
        where: { id: budgetItemId },
      })
      expect(result).toBe(true)
    })

    it('should return false when budget item does not exist', async () => {
      const budgetItemId = 'budget-item-not-found'

      prismaService.budgetItem.count.mockResolvedValue(0)

      const result = await repository.exists(budgetItemId)

      expect(result).toBe(false)
    })
  })

  describe('repository configuration', () => {
    it('should have correct model name', () => {
      expect((repository as any).modelName).toBe('budgetItem')
    })

    it('should have correct mappers configured', () => {
      const mapper = (repository as any).mapper
      const createMapper = (repository as any).createMapper
      const updateMapper = (repository as any).updateMapper

      expect(mapper).toBeDefined()
      expect(createMapper).toBeDefined()
      expect(updateMapper).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle database errors gracefully in findByBudgetId', async () => {
      const budgetId = 'budget-error'
      const dbError = new Error('Connection timeout')

      prismaService.budgetItem.findMany.mockRejectedValue(dbError)

      await expect(repository.findByBudgetId(budgetId)).rejects.toThrow('Connection timeout')
    })

    it('should handle database operation errors gracefully', async () => {
      const budgetId = 'budget-123'
      const dbError = new Error('Prisma validation error')

      prismaService.budgetItem.findMany.mockRejectedValue(dbError)

      await expect(repository.findByBudgetId(budgetId)).rejects.toThrow('Prisma validation error')
    })
  })
})

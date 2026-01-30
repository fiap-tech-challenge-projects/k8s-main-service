// using pure-unit style; no Nest Test module required
import { StockMovementType } from '@prisma/client'

import { StockMovement } from '@domain/stock/entities'
import { InsufficientStockException } from '@domain/stock/exceptions'
import { PrismaStockRepository } from '@infra/database/prisma/repositories'

describe('PrismaStockRepository - Movement', () => {
  let repository: PrismaStockRepository

  const mockPrismaService = {
    $transaction: jest.fn(),
    stockItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    stockMovement: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }

  beforeEach(async () => {
    // instantiate repository directly with mocked prisma client for pure-unit testing
    repository = new PrismaStockRepository(mockPrismaService as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createStockMovement', () => {
    describe('IN movement', () => {
      it('should create IN movement and increase stock level', async () => {
        // Arrange
        const stockId = 'stock-123'
        const stockMovement = new StockMovement(
          'movement-123',
          StockMovementType.IN,
          10,
          new Date(),
          stockId,
          'Purchase order received',
          'Items received from supplier',
          new Date(),
          new Date(),
        )

        const currentStockItem = {
          id: stockId,
          name: 'Test Item',
          sku: 'TEST-001',
          currentStock: 5,
          minStockLevel: 2,
          unitCost: 10.0,
          unitSalePrice: 20.0,
          description: 'Test item',
          supplier: 'Test Supplier',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const createdMovement = {
          id: 'movement-123',
          type: 'IN',
          quantity: 10,
          movementDate: stockMovement.movementDate,
          reason: 'Purchase order received',
          notes: 'Items received from supplier',
          stockId: stockId,
          createdAt: new Date(),
        }

        // Mock transaction callback
        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback({
            stockItem: {
              findUnique: jest.fn().mockResolvedValue(currentStockItem),
              update: jest.fn().mockResolvedValue({ ...currentStockItem, currentStock: 15 }),
            },
            stockMovement: {
              create: jest.fn().mockResolvedValue(createdMovement),
            },
          })
        })

        // Act
        const result = await repository.createStockMovement(stockMovement)

        // Assert
        expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1)
        expect(result).toBeInstanceOf(StockMovement)
        expect(result.type).toBe(StockMovementType.IN)
        expect(result.quantity).toBe(10)
        expect(result.stockId).toBe(stockId)
        expect(result.reason).toBe('Purchase order received')
        expect(result.notes).toBe('Items received from supplier')
      })
    })

    describe('OUT movement', () => {
      it('should create OUT movement and decrease stock level', async () => {
        // Arrange
        const stockId = 'stock-123'
        const stockMovement = new StockMovement(
          'movement-123',
          StockMovementType.OUT,
          3,
          new Date(),
          stockId,
          'Service order usage',
          'Used in repair service',
          new Date(),
          new Date(),
        )

        const currentStockItem = {
          id: stockId,
          name: 'Test Item',
          sku: 'TEST-001',
          currentStock: 10,
          minStockLevel: 2,
          unitCost: 10.0,
          unitSalePrice: 20.0,
          description: 'Test item',
          supplier: 'Test Supplier',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const createdMovement = {
          id: 'movement-123',
          type: 'OUT',
          quantity: 3,
          movementDate: stockMovement.movementDate,
          reason: 'Service order usage',
          notes: 'Used in repair service',
          stockId: stockId,
          createdAt: new Date(),
        }

        // Mock transaction callback
        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback({
            stockItem: {
              findUnique: jest.fn().mockResolvedValue(currentStockItem),
              update: jest.fn().mockResolvedValue({ ...currentStockItem, currentStock: 7 }),
            },
            stockMovement: {
              create: jest.fn().mockResolvedValue(createdMovement),
            },
          })
        })

        // Act
        const result = await repository.createStockMovement(stockMovement)

        // Assert
        expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1)
        expect(result).toBeInstanceOf(StockMovement)
        expect(result.type).toBe(StockMovementType.OUT)
        expect(result.quantity).toBe(3)
        expect(result.stockId).toBe(stockId)
      })

      it('should throw error when insufficient stock for OUT movement', async () => {
        // Arrange
        const stockId = 'stock-123'
        const stockMovement = new StockMovement(
          'movement-123',
          StockMovementType.OUT,
          15,
          new Date(),
          stockId,
          'Service order usage',
          undefined,
          new Date(),
          new Date(),
        )

        const currentStockItem = {
          id: stockId,
          name: 'Test Item',
          sku: 'TEST-001',
          currentStock: 10,
          minStockLevel: 2,
          unitCost: 10.0,
          unitSalePrice: 20.0,
          description: 'Test item',
          supplier: 'Test Supplier',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Mock transaction callback that throws error
        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback({
            stockItem: {
              findUnique: jest.fn().mockResolvedValue(currentStockItem),
            },
            stockMovement: {
              create: jest.fn(),
            },
          })
        })

        // Act & Assert
        await expect(repository.createStockMovement(stockMovement)).rejects.toThrow(
          InsufficientStockException,
        )
      })
    })

    describe('ADJUSTMENT movement', () => {
      it('should create ADJUSTMENT movement and set exact stock level', async () => {
        // Arrange
        const stockId = 'stock-123'
        const stockMovement = new StockMovement(
          'movement-123',
          StockMovementType.ADJUSTMENT,
          20,
          new Date(),
          stockId,
          'Physical inventory count',
          'Correcting inventory after physical count',
          new Date(),
          new Date(),
        )

        const currentStockItem = {
          id: stockId,
          name: 'Test Item',
          sku: 'TEST-001',
          currentStock: 15,
          minStockLevel: 2,
          unitCost: 10.0,
          unitSalePrice: 20.0,
          description: 'Test item',
          supplier: 'Test Supplier',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const createdMovement = {
          id: 'movement-123',
          type: 'ADJUSTMENT',
          quantity: 20,
          movementDate: stockMovement.movementDate,
          reason: 'Physical inventory count',
          notes: 'Correcting inventory after physical count',
          stockId: stockId,
          createdAt: new Date(),
        }

        // Mock transaction callback
        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback({
            stockItem: {
              findUnique: jest.fn().mockResolvedValue(currentStockItem),
              update: jest.fn().mockResolvedValue({ ...currentStockItem, currentStock: 20 }),
            },
            stockMovement: {
              create: jest.fn().mockResolvedValue(createdMovement),
            },
          })
        })

        // Act
        const result = await repository.createStockMovement(stockMovement)

        // Assert
        expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1)
        expect(result).toBeInstanceOf(StockMovement)
        expect(result.type).toBe(StockMovementType.ADJUSTMENT)
        expect(result.quantity).toBe(20)
        expect(result.stockId).toBe(stockId)
      })
    })

    describe('Error cases', () => {
      it('should throw error when stock item not found', async () => {
        // Arrange
        const stockId = 'nonexistent-stock'
        const stockMovement = new StockMovement(
          'movement-123',
          StockMovementType.IN,
          10,
          new Date(),
          stockId,
          undefined,
          undefined,
          new Date(),
          new Date(),
        )

        // Mock transaction callback that returns null for stock item
        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback({
            stockItem: {
              findUnique: jest.fn().mockResolvedValue(null),
            },
            stockMovement: {
              create: jest.fn(),
            },
          })
        })

        // Act & Assert
        await expect(repository.createStockMovement(stockMovement)).rejects.toThrow(
          `Stock item with ID ${stockId} not found`,
        )
      })

      it('should handle database errors', async () => {
        // Arrange
        const stockId = 'stock-123'
        const stockMovement = new StockMovement(
          'movement-123',
          StockMovementType.IN,
          10,
          new Date(),
          stockId,
          undefined,
          undefined,
          new Date(),
          new Date(),
        )

        // Mock transaction to throw error
        mockPrismaService.$transaction.mockRejectedValue(new Error('Database connection error'))

        // Act & Assert
        await expect(repository.createStockMovement(stockMovement)).rejects.toThrow(
          'Database connection error',
        )
      })
    })
  })

  describe('updateStockMovement', () => {
    const stockMovementId = 'stock-movement-123'
    const stockItemId = 'stock-item-123'

    const existingMovement = {
      id: stockMovementId,
      type: 'IN',
      quantity: 10,
      movementDate: new Date('2025-09-01'),
      stockId: stockItemId,
      reason: 'Initial stock',
      notes: 'Test movement',
      createdAt: new Date('2025-09-01'),
    }

    const currentStockItem = {
      id: stockItemId,
      name: 'Test Item',
      sku: 'TEST-001',
      currentStock: 20,
      minStockLevel: 5,
      unitCost: 10.0,
      unitSalePrice: 15.0,
      supplier: 'Test Supplier',
      description: 'Test Description',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    it('should update stock movement quantity and adjust stock levels', async () => {
      // Arrange
      const updateData = { quantity: 15 }
      const updatedMovement = { ...existingMovement, quantity: 15 }

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback({
          stockMovement: {
            findUnique: jest.fn().mockResolvedValue(existingMovement),
            update: jest.fn().mockResolvedValue(updatedMovement),
          },
          stockItem: {
            findUnique: jest.fn().mockResolvedValue(currentStockItem),
            update: jest.fn(),
          },
        })
      })

      // Act
      const result = await repository.updateStockMovement(stockMovementId, updateData)

      // Assert
      expect(mockPrismaService.$transaction).toHaveBeenCalled()
      expect(result).toBeInstanceOf(StockMovement)
      expect(result.quantity).toBe(15)
    })

    it('should update stock movement type and adjust stock levels correctly', async () => {
      // Arrange
      const updateData = { type: StockMovementType.OUT }
      const updatedMovement = { ...existingMovement, type: 'OUT' }

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback({
          stockMovement: {
            findUnique: jest.fn().mockResolvedValue(existingMovement),
            update: jest.fn().mockResolvedValue(updatedMovement),
          },
          stockItem: {
            findUnique: jest.fn().mockResolvedValue(currentStockItem),
            update: jest.fn(),
          },
        })
      })

      // Act
      const result = await repository.updateStockMovement(stockMovementId, updateData)

      // Assert
      expect(mockPrismaService.$transaction).toHaveBeenCalled()
      expect(result).toBeInstanceOf(StockMovement)
      expect(result.type).toBe(StockMovementType.OUT)
    })

    it('should throw error when stock movement not found', async () => {
      // Arrange
      const updateData = { quantity: 15 }

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback({
          stockMovement: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
          stockItem: {
            findUnique: jest.fn(),
            update: jest.fn(),
          },
        })
      })

      // Act & Assert
      await expect(repository.updateStockMovement(stockMovementId, updateData)).rejects.toThrow(
        `Stock movement with ID ${stockMovementId} not found`,
      )
    })

    it('should throw error when stock item not found', async () => {
      // Arrange
      const updateData = { quantity: 15 }

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback({
          stockMovement: {
            findUnique: jest.fn().mockResolvedValue(existingMovement),
          },
          stockItem: {
            findUnique: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
          },
        })
      })

      // Act & Assert
      await expect(repository.updateStockMovement(stockMovementId, updateData)).rejects.toThrow(
        `Stock item with ID ${stockItemId} not found`,
      )
    })

    it('should throw error when update would result in negative stock', async () => {
      // Arrange
      const updateData = { type: StockMovementType.OUT, quantity: 50 }

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback({
          stockMovement: {
            findUnique: jest.fn().mockResolvedValue(existingMovement),
          },
          stockItem: {
            findUnique: jest.fn().mockResolvedValue(currentStockItem),
            update: jest.fn(),
          },
        })
      })

      // Act & Assert
      await expect(repository.updateStockMovement(stockMovementId, updateData)).rejects.toThrow(
        InsufficientStockException,
      )
    })

    it('should handle database errors', async () => {
      // Arrange
      const updateData = { quantity: 15 }
      const dbError = new Error('Database connection failed')

      mockPrismaService.$transaction.mockRejectedValue(dbError)

      // Act & Assert
      await expect(repository.updateStockMovement(stockMovementId, updateData)).rejects.toThrow(
        'Database connection failed',
      )
    })
  })
})

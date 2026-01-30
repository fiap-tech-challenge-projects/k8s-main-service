// removed nest testing module import for pure unit test

import {
  CreateStockItemDto,
  PaginatedStockItemDto,
  StockItemResponseDto,
  UpdateStockItemDto,
} from '@application/stock/dto'
import {
  CheckSkuAvailabilityUseCase,
  CheckStockAvailabilityUseCase,
  CreateStockItemUseCase,
  CreateStockMovementUseCase,
  DecreaseStockUseCase,
  DeleteStockItemUseCase,
  GetAllStockItemsUseCase,
  GetStockItemByIdUseCase,
  GetStockItemBySkuUseCase,
  GetStockItemsByNameUseCase,
  GetStockItemsBySupplierUseCase,
  UpdateStockItemUseCase,
  UpdateStockMovementUseCase,
} from '@application/stock/use-cases'
import { StockItemNotFoundException } from '@domain/stock/exceptions'
import { StockController } from '@interfaces/rest/controllers'
import { Success } from '@shared/types'

describe('StockController', () => {
  let controller: StockController
  let createStockItemUseCase: jest.Mocked<CreateStockItemUseCase>
  let getAllStockItemsUseCase: jest.Mocked<GetAllStockItemsUseCase>
  let getStockItemByIdUseCase: jest.Mocked<GetStockItemByIdUseCase>
  let getStockItemBySkuUseCase: jest.Mocked<GetStockItemBySkuUseCase>
  let getStockItemsByNameUseCase: jest.Mocked<GetStockItemsByNameUseCase>
  let getStockItemsBySupplierUseCase: jest.Mocked<GetStockItemsBySupplierUseCase>
  let updateStockItemUseCase: jest.Mocked<UpdateStockItemUseCase>
  let deleteStockItemUseCase: jest.Mocked<DeleteStockItemUseCase>
  let checkSkuAvailabilityUseCase: jest.Mocked<CheckSkuAvailabilityUseCase>
  let checkStockAvailabilityUseCase: jest.Mocked<CheckStockAvailabilityUseCase>
  let createStockMovementUseCase: jest.Mocked<CreateStockMovementUseCase> // eslint-disable-line @typescript-eslint/no-unused-vars
  let updateStockMovementUseCase: jest.Mocked<UpdateStockMovementUseCase> // eslint-disable-line @typescript-eslint/no-unused-vars
  let decreaseStockUseCase: jest.Mocked<DecreaseStockUseCase> // eslint-disable-line @typescript-eslint/no-unused-vars

  const mockStockItemResponse: StockItemResponseDto = {
    id: 'stock-item-123',
    name: 'Filtro de Óleo',
    sku: 'FLT-001',
    currentStock: 10,
    minStockLevel: 5,
    unitCost: '25.50',
    unitSalePrice: '50.00',
    description: 'Filtro de óleo automotivo',
    supplier: 'Bosch',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T12:00:00Z'),
  }

  const mockCreateStockItemDto: CreateStockItemDto = {
    name: 'Pastilha de Freio',
    sku: 'PST-003',
    currentStock: 15,
    minStockLevel: 4,
    unitCost: '35.00',
    unitSalePrice: '70.00',
    description: 'Pastilha de freio cerâmica',
    supplier: 'Brembo',
  }

  const mockUpdateStockItemDto: UpdateStockItemDto = {
    name: 'Updated Name',
    currentStock: 20,
    unitCost: '30.00',
  }

  const mockPaginatedResponse: PaginatedStockItemDto = {
    data: [mockStockItemResponse],
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  }

  beforeEach(async () => {
    const mockCreateStockItemUseCase = { execute: jest.fn() }
    const mockGetAllStockItemsUseCase = { execute: jest.fn() }
    const mockGetStockItemByIdUseCase = { execute: jest.fn() }
    const mockGetStockItemBySkuUseCase = { execute: jest.fn() }
    const mockGetStockItemsByNameUseCase = { execute: jest.fn() }
    const mockGetStockItemsBySupplierUseCase = { execute: jest.fn() }
    const mockUpdateStockItemUseCase = { execute: jest.fn() }
    const mockDeleteStockItemUseCase = { execute: jest.fn() }
    const mockCheckSkuAvailabilityUseCase = { execute: jest.fn() }
    const mockCheckStockAvailabilityUseCase = { execute: jest.fn() }
    const mockCreateStockMovementUseCase = { execute: jest.fn() }
    const mockUpdateStockMovementUseCase = { execute: jest.fn() }
    const mockDecreaseStockUseCase = { execute: jest.fn() }

    controller = new StockController(
      mockCreateStockItemUseCase as any,
      mockGetAllStockItemsUseCase as any,
      mockGetStockItemByIdUseCase as any,
      mockGetStockItemBySkuUseCase as any,
      mockGetStockItemsByNameUseCase as any,
      mockGetStockItemsBySupplierUseCase as any,
      mockUpdateStockItemUseCase as any,
      mockDeleteStockItemUseCase as any,
      mockCreateStockMovementUseCase as any,
      mockUpdateStockMovementUseCase as any,
      mockDecreaseStockUseCase as any,
      mockCheckSkuAvailabilityUseCase as any,
      mockCheckStockAvailabilityUseCase as any,
    )

    createStockItemUseCase = mockCreateStockItemUseCase as any
    getAllStockItemsUseCase = mockGetAllStockItemsUseCase as any
    getStockItemByIdUseCase = mockGetStockItemByIdUseCase as any
    getStockItemBySkuUseCase = mockGetStockItemBySkuUseCase as any
    getStockItemsByNameUseCase = mockGetStockItemsByNameUseCase as any
    getStockItemsBySupplierUseCase = mockGetStockItemsBySupplierUseCase as any
    updateStockItemUseCase = mockUpdateStockItemUseCase as any
    deleteStockItemUseCase = mockDeleteStockItemUseCase as any
    createStockMovementUseCase = mockCreateStockMovementUseCase as any
    updateStockMovementUseCase = mockUpdateStockMovementUseCase as any
    decreaseStockUseCase = mockDecreaseStockUseCase as any
    checkSkuAvailabilityUseCase = mockCheckSkuAvailabilityUseCase as any
    checkStockAvailabilityUseCase = mockCheckStockAvailabilityUseCase as any

    jest.spyOn(controller['logger'], 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createStockItem', () => {
    it('should throw error when required field is missing in DTO', async () => {
      const invalidDto: any = { ...mockCreateStockItemDto }
      delete invalidDto.name
      createStockItemUseCase.execute.mockRejectedValue(new Error('Validation error'))
      await expect(controller.createStockItem(invalidDto)).rejects.toThrow('Validation error')
    })
    it('should create a stock item successfully', async () => {
      // Arrange
      createStockItemUseCase.execute.mockResolvedValue(new Success(mockStockItemResponse))

      // Act
      const result = await controller.createStockItem(mockCreateStockItemDto)

      // Assert
      expect(createStockItemUseCase.execute).toHaveBeenCalledWith(mockCreateStockItemDto)
      expect(result).toEqual(mockStockItemResponse)
    })

    it('should throw error when service create fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      createStockItemUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.createStockItem(mockCreateStockItemDto)).rejects.toThrow(serviceError)
      expect(createStockItemUseCase.execute).toHaveBeenCalledWith(mockCreateStockItemDto)
    })
  })

  describe('getAllStockItems', () => {
    it('should return paginated stock items with page and limit', async () => {
      // Arrange
      getAllStockItemsUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      // Act
      const result = await controller.getAllStockItems(1, 10)

      // Assert
      expect(getAllStockItemsUseCase.execute).toHaveBeenCalledWith(1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should return paginated stock items without pagination parameters', async () => {
      // Arrange
      getAllStockItemsUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      // Act
      const result = await controller.getAllStockItems()

      // Assert
      expect(getAllStockItemsUseCase.execute).toHaveBeenCalledWith(undefined, undefined)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should throw error when service getAll fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      getAllStockItemsUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.getAllStockItems(1, 10)).rejects.toThrow(serviceError)
      expect(getAllStockItemsUseCase.execute).toHaveBeenCalledWith(1, 10)
    })
  })

  describe('getStockItemById', () => {
    it('should return stock item when found', async () => {
      // Arrange
      getStockItemByIdUseCase.execute.mockResolvedValue(new Success(mockStockItemResponse))

      // Act
      const result = await controller.getStockItemById('stock-item-123')

      // Assert
      expect(getStockItemByIdUseCase.execute).toHaveBeenCalledWith('stock-item-123')
      expect(result).toEqual(mockStockItemResponse)
    })

    it('should throw StockItemNotFoundException when not found', async () => {
      getStockItemByIdUseCase.execute.mockRejectedValue(new StockItemNotFoundException('stock-123'))

      await expect(controller.getStockItemById('stock-123')).rejects.toThrow(
        StockItemNotFoundException,
      )
    })

    it('should throw error when service getById fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      getStockItemByIdUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.getStockItemById('stock-item-123')).rejects.toThrow(serviceError)
      expect(getStockItemByIdUseCase.execute).toHaveBeenCalledWith('stock-item-123')
    })
  })

  describe('getStockItemBySku', () => {
    it('should return stock item when found by SKU', async () => {
      // Arrange
      getStockItemBySkuUseCase.execute.mockResolvedValue(new Success(mockStockItemResponse))

      // Act
      const result = await controller.getStockItemBySku('FLT-001')

      // Assert
      expect(getStockItemBySkuUseCase.execute).toHaveBeenCalledWith('FLT-001')
      expect(result).toEqual(mockStockItemResponse)
    })

    it('should throw StockItemNotFoundException when not found', async () => {
      getStockItemBySkuUseCase.execute.mockRejectedValue(
        new StockItemNotFoundException('INVALID-SKU'),
      )

      await expect(controller.getStockItemBySku('INVALID-SKU')).rejects.toThrow(
        StockItemNotFoundException,
      )
    })

    it('should throw error when service getBySku fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      getStockItemBySkuUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.getStockItemBySku('FLT-001')).rejects.toThrow(serviceError)
      expect(getStockItemBySkuUseCase.execute).toHaveBeenCalledWith('FLT-001')
    })
  })

  describe('getStockItemsByName', () => {
    it('should return paginated stock items when found by name', async () => {
      // Arrange
      getStockItemsByNameUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      // Act
      const result = await controller.getStockItemsByName('Filtro de Óleo', 1, 10)

      // Assert
      expect(getStockItemsByNameUseCase.execute).toHaveBeenCalledWith('Filtro de Óleo', 1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should return empty result when no items found by name', async () => {
      // Arrange
      const emptyResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }
      getStockItemsByNameUseCase.execute.mockResolvedValue(new Success(emptyResponse))

      // Act
      const result = await controller.getStockItemsByName('Non-existent Item')

      // Assert
      expect(getStockItemsByNameUseCase.execute).toHaveBeenCalledWith(
        'Non-existent Item',
        undefined,
        undefined,
      )
      expect(result).toEqual(emptyResponse)
    })

    it('should throw error when service getByName fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      getStockItemsByNameUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.getStockItemsByName('Filtro')).rejects.toThrow(serviceError)
      expect(getStockItemsByNameUseCase.execute).toHaveBeenCalledWith(
        'Filtro',
        undefined,
        undefined,
      )
    })
  })

  describe('getStockItemsBySupplier', () => {
    it('should return paginated stock items when found by supplier', async () => {
      // Arrange
      getStockItemsBySupplierUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      // Act
      const result = await controller.getStockItemsBySupplier('Bosch', 1, 10)

      // Assert
      expect(getStockItemsBySupplierUseCase.execute).toHaveBeenCalledWith('Bosch', 1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should return empty result when no items found by supplier', async () => {
      // Arrange
      const emptyResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }
      getStockItemsBySupplierUseCase.execute.mockResolvedValue(new Success(emptyResponse))

      // Act
      const result = await controller.getStockItemsBySupplier('Unknown Supplier')

      // Assert
      expect(getStockItemsBySupplierUseCase.execute).toHaveBeenCalledWith(
        'Unknown Supplier',
        undefined,
        undefined,
      )
      expect(result).toEqual(emptyResponse)
    })

    it('should throw error when service getBySupplier fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      getStockItemsBySupplierUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.getStockItemsBySupplier('Bosch')).rejects.toThrow(serviceError)
      expect(getStockItemsBySupplierUseCase.execute).toHaveBeenCalledWith(
        'Bosch',
        undefined,
        undefined,
      )
    })
  })

  describe('updateStockItem', () => {
    it('should throw error when required field is missing in DTO', async () => {
      const invalidDto: any = { ...mockUpdateStockItemDto }
      delete invalidDto.name
      updateStockItemUseCase.execute.mockRejectedValue(new Error('Validation error'))
      await expect(controller.updateStockItem('stock-item-123', invalidDto)).rejects.toThrow(
        'Validation error',
      )
    })
    it('should handle get by id error', async () => {
      getStockItemByIdUseCase.execute.mockRejectedValue(new Error('Get failed'))
      await expect(controller.getStockItemById('stock-item-123')).rejects.toThrow('Get failed')
    })
    it('should handle get by sku error', async () => {
      getStockItemBySkuUseCase.execute.mockRejectedValue(new Error('Get failed'))
      await expect(controller.getStockItemBySku('FLT-001')).rejects.toThrow('Get failed')
    })
    it('should handle update error', async () => {
      updateStockItemUseCase.execute.mockRejectedValue(new Error('Update failed'))
      await expect(
        controller.updateStockItem('stock-item-123', mockUpdateStockItemDto),
      ).rejects.toThrow('Update failed')
    })
    it('should update stock item successfully', async () => {
      // Arrange
      const updatedResponse = { ...mockStockItemResponse, ...mockUpdateStockItemDto }
      updateStockItemUseCase.execute.mockResolvedValue(new Success(updatedResponse))

      // Act
      const result = await controller.updateStockItem('stock-item-123', mockUpdateStockItemDto)

      // Assert
      expect(updateStockItemUseCase.execute).toHaveBeenCalledWith(
        'stock-item-123',
        mockUpdateStockItemDto,
      )
      expect(result).toEqual(updatedResponse)
    })

    it('should throw error when service update fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      updateStockItemUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(
        controller.updateStockItem('stock-item-123', mockUpdateStockItemDto),
      ).rejects.toThrow(serviceError)
      expect(updateStockItemUseCase.execute).toHaveBeenCalledWith(
        'stock-item-123',
        mockUpdateStockItemDto,
      )
    })
  })

  describe('deleteStockItem', () => {
    it('should resolve to undefined when service returns false', async () => {
      deleteStockItemUseCase.execute.mockResolvedValue({ isSuccess: false } as any)
      await expect(controller.deleteStockItem('stock-item-123')).resolves.toBeUndefined()
    })
    it('should delete stock item successfully', async () => {
      // Arrange
      deleteStockItemUseCase.execute.mockResolvedValue(new Success(true))

      // Act
      await controller.deleteStockItem('stock-item-123')

      // Assert
      expect(deleteStockItemUseCase.execute).toHaveBeenCalledWith('stock-item-123')
    })

    it('should throw StockItemNotFoundException when stock item not found', async () => {
      deleteStockItemUseCase.execute.mockRejectedValue(
        new StockItemNotFoundException('non-existent-id'),
      )

      await expect(controller.deleteStockItem('non-existent-id')).rejects.toThrow(
        StockItemNotFoundException,
      )
      expect(deleteStockItemUseCase.execute).toHaveBeenCalledWith('non-existent-id')
    })

    it('should throw error when service delete fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      deleteStockItemUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.deleteStockItem('stock-item-123')).rejects.toThrow(serviceError)
      expect(deleteStockItemUseCase.execute).toHaveBeenCalledWith('stock-item-123')
    })
  })

  describe('checkSkuAvailability', () => {
    it('should return true when SKU is available', async () => {
      // Arrange
      checkSkuAvailabilityUseCase.execute.mockResolvedValue(new Success(true))

      // Act
      const result = await controller.checkSkuAvailability('NEW-SKU-001')

      // Assert
      expect(checkSkuAvailabilityUseCase.execute).toHaveBeenCalledWith('NEW-SKU-001')
      expect(result).toEqual({ exists: false, sku: 'NEW-SKU-001' })
    })

    it('should return false when SKU is not available', async () => {
      // Arrange
      checkSkuAvailabilityUseCase.execute.mockResolvedValue(new Success(false))

      // Act
      const result = await controller.checkSkuAvailability('EXISTING-SKU')

      // Assert
      expect(checkSkuAvailabilityUseCase.execute).toHaveBeenCalledWith('EXISTING-SKU')
      expect(result).toEqual({ exists: true, sku: 'EXISTING-SKU' })
    })

    it('should throw error when service isSkuAvailable fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      checkSkuAvailabilityUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.checkSkuAvailability('SKU-001')).rejects.toThrow(serviceError)
      expect(checkSkuAvailabilityUseCase.execute).toHaveBeenCalledWith('SKU-001')
    })
  })

  describe('checkStockAvailability', () => {
    it('should return true when stock item has sufficient stock', async () => {
      // Arrange
      getStockItemByIdUseCase.execute.mockResolvedValue(new Success(mockStockItemResponse))
      checkStockAvailabilityUseCase.execute.mockResolvedValue(new Success(true))

      // Act
      const result = await controller.checkStockAvailability('stock-item-123', 5)

      // Assert
      expect(getStockItemByIdUseCase.execute).toHaveBeenCalledWith('stock-item-123')
      expect(checkStockAvailabilityUseCase.execute).toHaveBeenCalledWith('stock-item-123', 5)
      expect(result).toEqual({
        available: true,
        requestedQuantity: 5,
        currentStock: 10,
      })
    })

    it('should return false when stock item has insufficient stock', async () => {
      // Arrange
      getStockItemByIdUseCase.execute.mockResolvedValue(new Success(mockStockItemResponse))
      checkStockAvailabilityUseCase.execute.mockResolvedValue(new Success(false))

      // Act
      const result = await controller.checkStockAvailability('stock-item-123', 20)

      // Assert
      expect(getStockItemByIdUseCase.execute).toHaveBeenCalledWith('stock-item-123')
      expect(checkStockAvailabilityUseCase.execute).toHaveBeenCalledWith('stock-item-123', 20)
      expect(result).toEqual({
        available: false,
        requestedQuantity: 20,
        currentStock: 10,
      })
    })

    it('should throw error when service hasStock fails', async () => {
      // Arrange
      const serviceError = new Error('Service error')
      getStockItemByIdUseCase.execute.mockResolvedValue(new Success(mockStockItemResponse))
      checkStockAvailabilityUseCase.execute.mockRejectedValue(serviceError)

      // Act & Assert
      await expect(controller.checkStockAvailability('stock-item-123', 5)).rejects.toThrow(
        serviceError,
      )
      expect(checkStockAvailabilityUseCase.execute).toHaveBeenCalledWith('stock-item-123', 5)
    })
  })
})

import { HttpStatus } from '@nestjs/common'
import { ServiceOrderStatus } from '@prisma/client'

import {
  CreateServiceOrderDto,
  UpdateServiceOrderDto,
  ServiceOrderResponseDto,
  PaginatedServiceOrdersResponseDto,
} from '@application/service-orders/dto'
import { ServiceOrderPresenter } from '@application/service-orders/presenters'
import {
  CreateServiceOrderUseCase,
  GetServiceOrderByIdUseCase,
  GetAllServiceOrdersUseCase,
  UpdateServiceOrderUseCase,
  GetServiceOrdersByStatusUseCase,
  GetServiceOrdersByClientIdUseCase,
  GetServiceOrdersByVehicleIdUseCase,
  GetOverdueServiceOrdersUseCase,
  DeleteServiceOrderUseCase,
} from '@application/service-orders/use-cases'
import { ServiceOrderController } from '@interfaces/rest/controllers'
import { Success, Failure } from '@shared/types'

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController
  let createServiceOrderUseCase: jest.Mocked<CreateServiceOrderUseCase>
  let getServiceOrderByIdUseCase: jest.Mocked<GetServiceOrderByIdUseCase>
  let getAllServiceOrdersUseCase: jest.Mocked<GetAllServiceOrdersUseCase>
  let updateServiceOrderUseCase: jest.Mocked<UpdateServiceOrderUseCase>
  let getServiceOrdersByStatusUseCase: jest.Mocked<GetServiceOrdersByStatusUseCase>
  let getServiceOrdersByClientIdUseCase: jest.Mocked<GetServiceOrdersByClientIdUseCase>
  let getServiceOrdersByVehicleIdUseCase: jest.Mocked<GetServiceOrdersByVehicleIdUseCase>
  let getOverdueServiceOrdersUseCase: jest.Mocked<GetOverdueServiceOrdersUseCase>
  let deleteServiceOrderUseCase: jest.Mocked<DeleteServiceOrderUseCase>

  const mockServiceOrderResponse: ServiceOrderResponseDto = {
    id: 'service-order-123',
    clientId: 'client-123',
    vehicleId: 'vehicle-123',
    status: ServiceOrderStatus.RECEIVED,
    requestDate: new Date('2025-01-01T10:00:00Z'),
    deliveryDate: undefined,
    cancellationReason: undefined,
    notes: 'Test service order',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T10:00:00Z'),
  }

  const mockCreateServiceOrderDto: CreateServiceOrderDto = {
    vehicleId: 'vehicle-123',
    notes: 'Test service order',
  }

  const mockUpdateServiceOrderDto: UpdateServiceOrderDto = {
    notes: 'Updated notes',
    status: ServiceOrderStatus.IN_EXECUTION,
  }

  const mockPaginatedResponse: PaginatedServiceOrdersResponseDto = {
    data: [mockServiceOrderResponse],
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  }

  beforeEach(() => {
    const mockPresenter = {} as any
    const mockCreateServiceOrderUseCase = { execute: jest.fn() }
    const mockGetServiceOrderByIdUseCase = { execute: jest.fn() }
    const mockGetAllServiceOrdersUseCase = { execute: jest.fn() }
    const mockUpdateServiceOrderUseCase = { execute: jest.fn() }
    const mockGetServiceOrdersByStatusUseCase = { execute: jest.fn() }
    const mockGetServiceOrdersByClientIdUseCase = { execute: jest.fn() }
    const mockGetServiceOrdersByVehicleIdUseCase = { execute: jest.fn() }
    const mockGetOverdueServiceOrdersUseCase = { execute: jest.fn() }
    const mockDeleteServiceOrderUseCase = { execute: jest.fn() }

    // instantiate controller directly
    controller = new ServiceOrderController(
      mockPresenter as any,
      mockCreateServiceOrderUseCase as any,
      mockGetServiceOrderByIdUseCase as any,
      mockGetAllServiceOrdersUseCase as any,
      mockUpdateServiceOrderUseCase as any,
      mockGetServiceOrdersByStatusUseCase as any,
      mockGetServiceOrdersByClientIdUseCase as any,
      mockGetServiceOrdersByVehicleIdUseCase as any,
      mockGetOverdueServiceOrdersUseCase as any,
      mockDeleteServiceOrderUseCase as any,
    )

    createServiceOrderUseCase = mockCreateServiceOrderUseCase as any
    getServiceOrderByIdUseCase = mockGetServiceOrderByIdUseCase as any
    getAllServiceOrdersUseCase = mockGetAllServiceOrdersUseCase as any
    updateServiceOrderUseCase = mockUpdateServiceOrderUseCase as any
    getServiceOrdersByStatusUseCase = mockGetServiceOrdersByStatusUseCase as any
    getServiceOrdersByClientIdUseCase = mockGetServiceOrdersByClientIdUseCase as any
    getServiceOrdersByVehicleIdUseCase = mockGetServiceOrdersByVehicleIdUseCase as any
    getOverdueServiceOrdersUseCase = mockGetOverdueServiceOrdersUseCase as any
    deleteServiceOrderUseCase = mockDeleteServiceOrderUseCase as any

    jest.spyOn(controller['logger'], 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a service order successfully', async () => {
      // Arrange
      const mockPresenterResponse = {
        statusCode: HttpStatus.CREATED,
        message: 'Service order created successfully',
        data: mockServiceOrderResponse,
      }
      createServiceOrderUseCase.execute.mockResolvedValue(new Success(mockServiceOrderResponse))

      // Mock the static method
      jest
        .spyOn(ServiceOrderPresenter, 'presentCreateSuccess')
        .mockReturnValue(mockPresenterResponse)

      // Act
      const result = await controller.create(mockCreateServiceOrderDto)

      // Assert
      expect(createServiceOrderUseCase.execute).toHaveBeenCalledWith(mockCreateServiceOrderDto)
      expect(ServiceOrderPresenter.presentCreateSuccess).toHaveBeenCalledWith(
        mockServiceOrderResponse,
      )
      expect(result).toEqual(mockPresenterResponse)
    })

    it('should throw error when use case fails', async () => {
      // Arrange
      const error = new Error('Use case error')
      createServiceOrderUseCase.execute.mockResolvedValue(new Failure(error))

      // Act & Assert
      await expect(controller.create(mockCreateServiceOrderDto)).rejects.toThrow(error)
      expect(createServiceOrderUseCase.execute).toHaveBeenCalledWith(mockCreateServiceOrderDto)
      expect(controller['logger'].error).toHaveBeenCalledWith(
        'Error creating service order:',
        error,
      )
    })
  })

  describe('getAll', () => {
    it('should return paginated service orders with page and limit', async () => {
      // Arrange
      getAllServiceOrdersUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      // Act
      const result = await controller.getAll(1, 10)

      // Assert
      expect(getAllServiceOrdersUseCase.execute).toHaveBeenCalledWith(1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should return paginated service orders without pagination parameters', async () => {
      // Arrange
      getAllServiceOrdersUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      // Act
      const result = await controller.getAll()

      // Assert
      expect(getAllServiceOrdersUseCase.execute).toHaveBeenCalledWith(undefined, undefined)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should throw error when use case fails', async () => {
      // Arrange
      const error = new Error('Use case error')
      getAllServiceOrdersUseCase.execute.mockResolvedValue(new Failure(error))

      // Act & Assert
      await expect(controller.getAll(1, 10)).rejects.toThrow(error)
      expect(getAllServiceOrdersUseCase.execute).toHaveBeenCalledWith(1, 10)
      expect(controller['logger'].error).toHaveBeenCalledWith(
        'Error getting all service orders:',
        error,
      )
    })
  })

  describe('getByStatus', () => {
    it('should return service orders by status', async () => {
      // Arrange
      const status = ServiceOrderStatus.RECEIVED
      getServiceOrdersByStatusUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      // Act
      const result = await controller.getByStatus(status, 1, 10)

      // Assert
      expect(getServiceOrdersByStatusUseCase.execute).toHaveBeenCalledWith(status, 1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should throw error when use case fails', async () => {
      // Arrange
      const status = ServiceOrderStatus.RECEIVED
      const error = new Error('Use case error')
      getServiceOrdersByStatusUseCase.execute.mockResolvedValue(new Failure(error))

      // Act & Assert
      await expect(controller.getByStatus(status, 1, 10)).rejects.toThrow(error)
      expect(getServiceOrdersByStatusUseCase.execute).toHaveBeenCalledWith(status, 1, 10)
    })
  })

  describe('getByClientId', () => {
    it('should return service orders by client ID', async () => {
      // Arrange
      const clientId = 'client-123'
      getServiceOrdersByClientIdUseCase.execute.mockResolvedValue(
        new Success(mockPaginatedResponse),
      )

      // Act
      const result = await controller.getByClientId(clientId, 1, 10)

      // Assert
      expect(getServiceOrdersByClientIdUseCase.execute).toHaveBeenCalledWith(clientId, 1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should throw error when use case fails', async () => {
      // Arrange
      const clientId = 'client-123'
      const error = new Error('Use case error')
      getServiceOrdersByClientIdUseCase.execute.mockResolvedValue(new Failure(error))

      // Act & Assert
      await expect(controller.getByClientId(clientId, 1, 10)).rejects.toThrow(error)
      expect(getServiceOrdersByClientIdUseCase.execute).toHaveBeenCalledWith(clientId, 1, 10)
    })
  })

  describe('getByVehicleId', () => {
    it('should return service orders by vehicle ID', async () => {
      // Arrange
      const vehicleId = 'vehicle-123'
      getServiceOrdersByVehicleIdUseCase.execute.mockResolvedValue(
        new Success(mockPaginatedResponse),
      )

      // Act
      const result = await controller.getByVehicleId(vehicleId, 1, 10)

      // Assert
      expect(getServiceOrdersByVehicleIdUseCase.execute).toHaveBeenCalledWith(vehicleId, 1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should throw error when use case fails', async () => {
      // Arrange
      const vehicleId = 'vehicle-123'
      const error = new Error('Use case error')
      getServiceOrdersByVehicleIdUseCase.execute.mockResolvedValue(new Failure(error))

      // Act & Assert
      await expect(controller.getByVehicleId(vehicleId, 1, 10)).rejects.toThrow(error)
      expect(getServiceOrdersByVehicleIdUseCase.execute).toHaveBeenCalledWith(vehicleId, 1, 10)
    })
  })

  describe('getOverdue', () => {
    it('should return overdue service orders', async () => {
      // Arrange
      getOverdueServiceOrdersUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      // Act
      const result = await controller.getOverdue(1, 10)

      // Assert
      expect(getOverdueServiceOrdersUseCase.execute).toHaveBeenCalledWith(1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should throw error when use case fails', async () => {
      // Arrange
      const error = new Error('Use case error')
      getOverdueServiceOrdersUseCase.execute.mockResolvedValue(new Failure(error))

      // Act & Assert
      await expect(controller.getOverdue(1, 10)).rejects.toThrow(error)
      expect(getOverdueServiceOrdersUseCase.execute).toHaveBeenCalledWith(1, 10)
    })
  })

  describe('getById', () => {
    it('should return service order by ID', async () => {
      // Arrange
      const id = 'service-order-123'
      getServiceOrderByIdUseCase.execute.mockResolvedValue(new Success(mockServiceOrderResponse))

      // Act
      const result = await controller.getById(id)

      // Assert
      expect(getServiceOrderByIdUseCase.execute).toHaveBeenCalledWith(id)
      expect(result).toEqual(mockServiceOrderResponse)
    })

    it('should throw error when use case fails', async () => {
      // Arrange
      const id = 'service-order-123'
      const error = new Error('Use case error')
      getServiceOrderByIdUseCase.execute.mockResolvedValue(new Failure(error))

      // Act & Assert
      await expect(controller.getById(id)).rejects.toThrow(error)
      expect(getServiceOrderByIdUseCase.execute).toHaveBeenCalledWith(id)
    })
  })

  describe('update', () => {
    it('should update service order successfully', async () => {
      // Arrange
      const id = 'service-order-123'
      const updatedServiceOrder = { ...mockServiceOrderResponse, notes: 'Updated notes' }
      updateServiceOrderUseCase.execute.mockResolvedValue(new Success(updatedServiceOrder))

      // Act
      const result = await controller.update(id, mockUpdateServiceOrderDto)

      // Assert
      expect(updateServiceOrderUseCase.execute).toHaveBeenCalledWith(id, mockUpdateServiceOrderDto)
      expect(result).toEqual(updatedServiceOrder)
    })

    it('should throw error when use case fails', async () => {
      // Arrange
      const id = 'service-order-123'
      const error = new Error('Use case error')
      updateServiceOrderUseCase.execute.mockResolvedValue(new Failure(error))

      // Act & Assert
      await expect(controller.update(id, mockUpdateServiceOrderDto)).rejects.toThrow(error)
      expect(updateServiceOrderUseCase.execute).toHaveBeenCalledWith(id, mockUpdateServiceOrderDto)
    })
  })

  describe('delete', () => {
    it('should delete service order successfully', async () => {
      // Arrange
      const id = 'service-order-123'
      deleteServiceOrderUseCase.execute.mockResolvedValue(new Success(true))

      // Act
      await controller.delete(id)

      // Assert
      expect(deleteServiceOrderUseCase.execute).toHaveBeenCalledWith(id)
    })

    it('should throw error when use case fails', async () => {
      // Arrange
      const id = 'service-order-123'
      const error = new Error('Use case error')
      deleteServiceOrderUseCase.execute.mockResolvedValue(new Failure(error))

      // Act & Assert
      await expect(controller.delete(id)).rejects.toThrow(error)
      expect(deleteServiceOrderUseCase.execute).toHaveBeenCalledWith(id)
      expect(controller['logger'].error).toHaveBeenCalledWith(
        `Error deleting service order ${id}:`,
        error,
      )
    })
  })
})

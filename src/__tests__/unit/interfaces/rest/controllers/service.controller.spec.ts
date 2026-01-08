import { Logger } from '@nestjs/common'

import {
  ServiceResponseDto,
  CreateServiceDto,
  UpdateServiceDto,
  PaginatedServicesResponseDto,
  CreateServiceUseCase,
  GetAllServicesUseCase,
  GetServiceByIdUseCase,
  SearchServicesByNameUseCase,
  UpdateServiceUseCase,
  DeleteServiceUseCase,
} from '@application/services'
import { ServiceNotFoundException } from '@domain/services/exceptions'
import { ServiceController } from '@interfaces/rest/controllers'
import { EntityNotFoundException, Success } from '@shared'

describe('ServiceController', () => {
  let controller: ServiceController
  let createServiceUseCase: jest.Mocked<CreateServiceUseCase>
  let getAllServicesUseCase: jest.Mocked<GetAllServicesUseCase>
  let getServiceByIdUseCase: jest.Mocked<GetServiceByIdUseCase>
  let searchServicesByNameUseCase: jest.Mocked<SearchServicesByNameUseCase>
  let updateServiceUseCase: jest.Mocked<UpdateServiceUseCase>
  let deleteServiceUseCase: jest.Mocked<DeleteServiceUseCase>

  const mockServiceResponse: ServiceResponseDto = {
    id: 'service-123',
    name: 'Service 1',
    description: 'A test service',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    price: '',
    estimatedDuration: '',
  }

  const mockPaginatedResponse: PaginatedServicesResponseDto = {
    data: [mockServiceResponse],
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
    const mockCreateServiceUseCase = { execute: jest.fn() }
    const mockGetAllServicesUseCase = { execute: jest.fn() }
    const mockGetServiceByIdUseCase = { execute: jest.fn() }
    const mockSearchServicesByNameUseCase = { execute: jest.fn() }
    const mockUpdateServiceUseCase = { execute: jest.fn() }
    const mockDeleteServiceUseCase = { execute: jest.fn() }

    controller = new ServiceController(
      mockCreateServiceUseCase as any,
      mockGetAllServicesUseCase as any,
      mockGetServiceByIdUseCase as any,
      mockSearchServicesByNameUseCase as any,
      mockUpdateServiceUseCase as any,
      mockDeleteServiceUseCase as any,
    )

    createServiceUseCase = mockCreateServiceUseCase as any
    getAllServicesUseCase = mockGetAllServicesUseCase as any
    getServiceByIdUseCase = mockGetServiceByIdUseCase as any
    searchServicesByNameUseCase = mockSearchServicesByNameUseCase as any
    updateServiceUseCase = mockUpdateServiceUseCase as any
    deleteServiceUseCase = mockDeleteServiceUseCase as any

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'warn').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createService', () => {
    it('should create a service successfully', async () => {
      const createDto: CreateServiceDto = {
        name: 'Service 1',
        description: 'A test service',
        price: '',
        estimatedDuration: '',
      }

      createServiceUseCase.execute.mockResolvedValue(new Success(mockServiceResponse))

      const result = await controller.createService(createDto)

      expect(createServiceUseCase.execute).toHaveBeenCalledWith(createDto)
      expect(result).toEqual(mockServiceResponse)
    })

    it('should throw error if service creation fails', async () => {
      const createDto: CreateServiceDto = {
        name: 'Service 1',
        description: 'A test service',
        price: '',
        estimatedDuration: '',
      }

      createServiceUseCase.execute.mockRejectedValue(new Error('Creation failed'))

      await expect(controller.createService(createDto)).rejects.toThrow('Creation failed')
    })
  })

  describe('getServiceById', () => {
    it('should return service when found', async () => {
      getServiceByIdUseCase.execute.mockResolvedValue(new Success(mockServiceResponse))

      const result = await controller.getServiceById('service-123')

      expect(getServiceByIdUseCase.execute).toHaveBeenCalledWith('service-123')
      expect(result).toEqual(mockServiceResponse)
    })

    it('should throw EntityNotFoundException if service not found', async () => {
      getServiceByIdUseCase.execute.mockRejectedValue(
        new EntityNotFoundException('Service', 'service-123'),
      )

      await expect(controller.getServiceById('service-123')).rejects.toThrow(
        EntityNotFoundException,
      )
    })

    it('should handle and rethrow unexpected errors', async () => {
      getServiceByIdUseCase.execute.mockRejectedValue(new Error('Unexpected error'))

      await expect(controller.getServiceById('service-123')).rejects.toThrow('Unexpected error')
    })
  })

  describe('getAllServices', () => {
    it('should return paginated list of services', async () => {
      getAllServicesUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.getAllServices(1, 10)

      expect(getAllServicesUseCase.execute).toHaveBeenCalledWith(1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should handle default pagination', async () => {
      getAllServicesUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.getAllServices()

      expect(getAllServicesUseCase.execute).toHaveBeenCalledWith(undefined, undefined)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should throw if service fails', async () => {
      getAllServicesUseCase.execute.mockRejectedValue(new Error('Service failure'))

      await expect(controller.getAllServices(1, 10)).rejects.toThrow('Service failure')
    })
  })

  describe('searchServicesByName', () => {
    it('should return paginated search results', async () => {
      searchServicesByNameUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.searchServicesByName('Service', 1, 10)

      expect(searchServicesByNameUseCase.execute).toHaveBeenCalledWith('Service', 1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should handle default params', async () => {
      searchServicesByNameUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.searchServicesByName('Service')

      expect(searchServicesByNameUseCase.execute).toHaveBeenCalledWith(
        'Service',
        undefined,
        undefined,
      )
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should return empty result on error', async () => {
      searchServicesByNameUseCase.execute.mockRejectedValue(new Error('Search error'))

      const result = await controller.searchServicesByName('Service', 1, 10)

      expect(result.data).toHaveLength(0)
      expect(result.meta.total).toBe(0)
      expect(result.meta.page).toBe(1)
      expect(result.meta.limit).toBe(10)
    })
  })

  describe('updateService', () => {
    it('should update service successfully', async () => {
      const updateDto: UpdateServiceDto = {
        name: 'Updated Service',
        description: 'Updated description',
      }

      updateServiceUseCase.execute.mockResolvedValue(new Success(mockServiceResponse))

      const result = await controller.updateService('service-123', updateDto)

      expect(updateServiceUseCase.execute).toHaveBeenCalledWith('service-123', updateDto)
      expect(result).toEqual(mockServiceResponse)
    })

    it('should throw EntityNotFoundException if service not found', async () => {
      updateServiceUseCase.execute.mockRejectedValue(
        new EntityNotFoundException('Service', 'service-123'),
      )

      await expect(controller.updateService('service-123', {} as any)).rejects.toThrow(
        EntityNotFoundException,
      )
    })

    it('should handle unexpected errors', async () => {
      updateServiceUseCase.execute.mockRejectedValue(new Error('Update failed'))

      await expect(controller.updateService('service-123', {} as any)).rejects.toThrow(
        'Update failed',
      )
    })
  })

  describe('deleteService', () => {
    it('should delete service successfully', async () => {
      deleteServiceUseCase.execute.mockResolvedValue(new Success(true))

      await expect(controller.deleteService('service-123')).resolves.toBeUndefined()

      expect(deleteServiceUseCase.execute).toHaveBeenCalledWith('service-123')
    })

    it('should handle unexpected errors', async () => {
      deleteServiceUseCase.execute.mockRejectedValue(new Error('Delete failed'))

      await expect(controller.deleteService('service-123')).rejects.toThrow('Delete failed')
    })

    it('should throw ServiceNotFoundException if service not found', async () => {
      deleteServiceUseCase.execute.mockRejectedValue(new ServiceNotFoundException('service-123'))

      await expect(controller.deleteService('service-123')).rejects.toThrow(
        ServiceNotFoundException,
      )
    })
  })
})

import { Logger } from '@nestjs/common'

import { VehicleDtoFactory } from '@/__tests__/factories/dtos'
import {
  CreateVehicleDto,
  PaginatedVehiclesResponseDto,
  UpdateVehicleDto,
  VehicleResponseDto,
} from '@application/vehicles/dto'
import {
  CheckLicensePlateAvailabilityUseCase,
  CheckVinAvailabilityUseCase,
  CreateVehicleUseCase,
  DeleteVehicleUseCase,
  GetAllVehiclesUseCase,
  GetVehicleByIdUseCase,
  GetVehicleByLicensePlateUseCase,
  GetVehicleByVinUseCase,
  GetVehiclesByClientUseCase,
  SearchVehiclesByMakeModelUseCase,
  UpdateVehicleUseCase,
} from '@application/vehicles/use-cases'
import { VehicleNotFoundException } from '@domain/vehicles/exceptions'
import { VehicleController } from '@interfaces/rest/controllers'
import { Success } from '@shared/types'

describe('VehicleController', () => {
  let controller: VehicleController
  let createVehicleUseCase: jest.Mocked<CreateVehicleUseCase>
  let getAllVehiclesUseCase: jest.Mocked<GetAllVehiclesUseCase>
  let getVehicleByLicensePlateUseCase: jest.Mocked<GetVehicleByLicensePlateUseCase>
  let getVehicleByVinUseCase: jest.Mocked<GetVehicleByVinUseCase>
  let getVehiclesByClientUseCase: jest.Mocked<GetVehiclesByClientUseCase>
  let searchVehiclesByMakeModelUseCase: jest.Mocked<SearchVehiclesByMakeModelUseCase>
  let checkLicensePlateAvailabilityUseCase: jest.Mocked<CheckLicensePlateAvailabilityUseCase>
  let checkVinAvailabilityUseCase: jest.Mocked<CheckVinAvailabilityUseCase>
  let getVehicleByIdUseCase: jest.Mocked<GetVehicleByIdUseCase>
  let updateVehicleUseCase: jest.Mocked<UpdateVehicleUseCase>
  let deleteVehicleUseCase: jest.Mocked<DeleteVehicleUseCase>

  const mockVehicleResponse: VehicleResponseDto = VehicleDtoFactory.createVehicleResponseDto({
    id: 'vehicle-123',
    licensePlate: 'ABC-1234',
  })

  const mockPaginatedResponse: PaginatedVehiclesResponseDto =
    VehicleDtoFactory.createPaginatedVehiclesResponseDto({
      data: [mockVehicleResponse],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
    })

  beforeEach(() => {
    const mockCreateVehicleUseCase = { execute: jest.fn() }
    const mockGetAllVehiclesUseCase = { execute: jest.fn() }
    const mockGetVehicleByLicensePlateUseCase = { execute: jest.fn() }
    const mockGetVehicleByVinUseCase = { execute: jest.fn() }
    const mockGetVehiclesByClientUseCase = { execute: jest.fn() }
    const mockSearchVehiclesByMakeModelUseCase = { execute: jest.fn() }
    const mockCheckLicensePlateAvailabilityUseCase = { execute: jest.fn() }
    const mockCheckVinAvailabilityUseCase = { execute: jest.fn() }
    const mockGetVehicleByIdUseCase = { execute: jest.fn() }
    const mockUpdateVehicleUseCase = { execute: jest.fn() }
    const mockDeleteVehicleUseCase = { execute: jest.fn() }

    controller = new VehicleController(
      mockCreateVehicleUseCase as any,
      mockGetAllVehiclesUseCase as any,
      mockGetVehicleByLicensePlateUseCase as any,
      mockGetVehicleByVinUseCase as any,
      mockGetVehiclesByClientUseCase as any,
      mockSearchVehiclesByMakeModelUseCase as any,
      mockCheckLicensePlateAvailabilityUseCase as any,
      mockCheckVinAvailabilityUseCase as any,
      mockGetVehicleByIdUseCase as any,
      mockUpdateVehicleUseCase as any,
      mockDeleteVehicleUseCase as any,
    )

    createVehicleUseCase = mockCreateVehicleUseCase as any
    getAllVehiclesUseCase = mockGetAllVehiclesUseCase as any
    getVehicleByLicensePlateUseCase = mockGetVehicleByLicensePlateUseCase as any
    getVehicleByVinUseCase = mockGetVehicleByVinUseCase as any
    getVehiclesByClientUseCase = mockGetVehiclesByClientUseCase as any
    searchVehiclesByMakeModelUseCase = mockSearchVehiclesByMakeModelUseCase as any
    checkLicensePlateAvailabilityUseCase = mockCheckLicensePlateAvailabilityUseCase as any
    checkVinAvailabilityUseCase = mockCheckVinAvailabilityUseCase as any
    getVehicleByIdUseCase = mockGetVehicleByIdUseCase as any
    updateVehicleUseCase = mockUpdateVehicleUseCase as any
    deleteVehicleUseCase = mockDeleteVehicleUseCase as any

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createVehicle', () => {
    it('should create vehicle successfully', async () => {
      const createDto: CreateVehicleDto = VehicleDtoFactory.createCreateVehicleDto()

      createVehicleUseCase.execute.mockResolvedValue(new Success(mockVehicleResponse))

      const result = await controller.createVehicle(createDto)

      expect(createVehicleUseCase.execute).toHaveBeenCalledWith(createDto)
      expect(result).toEqual(mockVehicleResponse)
    })

    it('should throw error when service fails', async () => {
      const createDto: CreateVehicleDto = VehicleDtoFactory.createMinimalCreateVehicleDto()
      createVehicleUseCase.execute.mockRejectedValue(new Error('Service error'))

      await expect(controller.createVehicle(createDto)).rejects.toThrow('Service error')
    })
  })

  describe('getAllVehicles', () => {
    it('should return paginated vehicles', async () => {
      getAllVehiclesUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.getAllVehicles(1, 10)

      expect(getAllVehiclesUseCase.execute).toHaveBeenCalledWith(1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should handle default pagination parameters', async () => {
      getAllVehiclesUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.getAllVehicles()

      expect(getAllVehiclesUseCase.execute).toHaveBeenCalledWith(undefined, undefined)
      expect(result).toEqual(mockPaginatedResponse)
    })
  })

  describe('getVehicleByLicensePlate', () => {
    it('should return vehicle by license plate', async () => {
      getVehicleByLicensePlateUseCase.execute.mockResolvedValue(new Success(mockVehicleResponse))

      const result = await controller.getVehicleByLicensePlate('ABC-1234')

      expect(getVehicleByLicensePlateUseCase.execute).toHaveBeenCalledWith('ABC-1234')
      expect(result).toEqual(mockVehicleResponse)
    })

    it('should throw VehicleNotFoundException when not found', async () => {
      getVehicleByLicensePlateUseCase.execute.mockRejectedValue(
        new VehicleNotFoundException('ABC-1234'),
      )

      await expect(controller.getVehicleByLicensePlate('ABC-1234')).rejects.toThrow(
        VehicleNotFoundException,
      )
    })
  })

  describe('getVehicleByVin', () => {
    it('should return vehicle by vin', async () => {
      getVehicleByVinUseCase.execute.mockResolvedValue(new Success(mockVehicleResponse))

      const result = await controller.getVehicleByVin('1HGBH41JXMN109186')

      expect(getVehicleByVinUseCase.execute).toHaveBeenCalledWith('1HGBH41JXMN109186')
      expect(result).toEqual(mockVehicleResponse)
    })

    it('should throw VehicleNotFoundException when not found', async () => {
      getVehicleByVinUseCase.execute.mockRejectedValue(
        new VehicleNotFoundException('1HGBH41JXMN109186'),
      )

      await expect(controller.getVehicleByVin('1HGBH41JXMN109186')).rejects.toThrow(
        VehicleNotFoundException,
      )
    })
  })

  describe('getVehiclesByClient', () => {
    it('should return paginated vehicles by client id', async () => {
      getVehiclesByClientUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.getVehiclesByClient('client-1', 1, 10)

      expect(getVehiclesByClientUseCase.execute).toHaveBeenCalledWith('client-1', 1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should handle default pagination parameters', async () => {
      getVehiclesByClientUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.getVehiclesByClient('client-1')

      expect(getVehiclesByClientUseCase.execute).toHaveBeenCalledWith(
        'client-1',
        undefined,
        undefined,
      )
      expect(result).toEqual(mockPaginatedResponse)
    })
  })

  describe('searchVehicles', () => {
    it('should return paginated search results', async () => {
      searchVehiclesByMakeModelUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.searchVehicles('Toyota', 'Corolla', undefined, 1, 10)

      expect(searchVehiclesByMakeModelUseCase.execute).toHaveBeenCalledWith(
        'Toyota',
        'Corolla',
        undefined,
        1,
        10,
      )
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should handle default pagination parameters', async () => {
      searchVehiclesByMakeModelUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.searchVehicles('Toyota', 'Corolla')

      expect(searchVehiclesByMakeModelUseCase.execute).toHaveBeenCalledWith(
        'Toyota',
        'Corolla',
        undefined,
        undefined,
        undefined,
      )
      expect(result).toEqual(mockPaginatedResponse)
    })
  })

  describe('checkLicensePlateAvailability', () => {
    it('should return availability status', async () => {
      checkLicensePlateAvailabilityUseCase.execute.mockResolvedValue(
        new Success({ available: true }),
      )

      const result = await controller.checkLicensePlateAvailability('ABC-1234')

      expect(checkLicensePlateAvailabilityUseCase.execute).toHaveBeenCalledWith('ABC-1234')
      expect(result).toEqual({ available: true })
    })
  })

  describe('checkVinAvailability', () => {
    it('should return availability status', async () => {
      checkVinAvailabilityUseCase.execute.mockResolvedValue(new Success({ available: false }))

      const result = await controller.checkVinAvailability('1HGBH41JXMN109186')

      expect(checkVinAvailabilityUseCase.execute).toHaveBeenCalledWith('1HGBH41JXMN109186')
      expect(result).toEqual({ available: false })
    })
  })

  describe('getVehicleById', () => {
    it('should return vehicle by id', async () => {
      getVehicleByIdUseCase.execute.mockResolvedValue(new Success(mockVehicleResponse))

      const result = await controller.getVehicleById('vehicle-123')

      expect(getVehicleByIdUseCase.execute).toHaveBeenCalledWith('vehicle-123')
      expect(result).toEqual(mockVehicleResponse)
    })

    it('should throw VehicleNotFoundException when not found', async () => {
      getVehicleByIdUseCase.execute.mockRejectedValue(new VehicleNotFoundException('vehicle-123'))

      await expect(controller.getVehicleById('vehicle-123')).rejects.toThrow(
        VehicleNotFoundException,
      )
    })
  })

  describe('updateVehicle', () => {
    it('should update vehicle successfully', async () => {
      const updateDto: UpdateVehicleDto = VehicleDtoFactory.createUpdateVehicleDto()

      updateVehicleUseCase.execute.mockResolvedValue(new Success(mockVehicleResponse))

      const result = await controller.updateVehicle('vehicle-123', updateDto)

      expect(updateVehicleUseCase.execute).toHaveBeenCalledWith('vehicle-123', updateDto)
      expect(result).toEqual(mockVehicleResponse)
    })

    it('should throw error when service fails', async () => {
      const updateDto: UpdateVehicleDto = VehicleDtoFactory.createPartialUpdateVehicleDto()
      updateVehicleUseCase.execute.mockRejectedValue(new VehicleNotFoundException('vehicle-123'))

      await expect(controller.updateVehicle('vehicle-123', updateDto)).rejects.toThrow(
        VehicleNotFoundException,
      )
    })
  })

  describe('deleteVehicle', () => {
    it('should delete vehicle successfully', async () => {
      deleteVehicleUseCase.execute.mockResolvedValue(new Success(true))

      await controller.deleteVehicle('vehicle-123')

      expect(deleteVehicleUseCase.execute).toHaveBeenCalledWith('vehicle-123')
    })

    it('should throw error when service fails', async () => {
      deleteVehicleUseCase.execute.mockRejectedValue(new Error('Service error'))

      await expect(controller.deleteVehicle('vehicle-123')).rejects.toThrow('Service error')
    })
  })
})

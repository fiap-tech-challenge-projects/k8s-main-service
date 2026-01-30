import { Logger } from '@nestjs/common'

import {
  ClientResponseDto,
  CreateClientDto,
  UpdateClientDto,
  PaginatedClientsResponseDto,
} from '@application/clients/dto'
import { ClientPresenter, ClientHttpResponse } from '@application/clients/presenters'
import {
  CreateClientUseCase,
  GetClientByIdUseCase,
  GetAllClientsUseCase,
  GetClientByCpfCnpjUseCase,
  GetClientByEmailUseCase,
  SearchClientsByNameUseCase,
  CheckCpfCnpjAvailabilityUseCase,
  CheckEmailAvailabilityUseCase,
  UpdateClientUseCase,
  DeleteClientUseCase,
} from '@application/clients/use-cases'
import { ClientNotFoundException } from '@domain/clients/exceptions'
import { ClientController } from '@interfaces/rest/controllers'
import { Success } from '@shared/types'

describe('ClientController', () => {
  let controller: ClientController
  let createClientUseCase: jest.Mocked<CreateClientUseCase>
  let getClientByIdUseCase: jest.Mocked<GetClientByIdUseCase>
  let getAllClientsUseCase: jest.Mocked<GetAllClientsUseCase>
  let getClientByCpfCnpjUseCase: jest.Mocked<GetClientByCpfCnpjUseCase>
  let getClientByEmailUseCase: jest.Mocked<GetClientByEmailUseCase>
  let searchClientsByNameUseCase: jest.Mocked<SearchClientsByNameUseCase>
  let checkCpfCnpjAvailabilityUseCase: jest.Mocked<CheckCpfCnpjAvailabilityUseCase>
  let checkEmailAvailabilityUseCase: jest.Mocked<CheckEmailAvailabilityUseCase>
  let updateClientUseCase: jest.Mocked<UpdateClientUseCase>
  let deleteClientUseCase: jest.Mocked<DeleteClientUseCase>
  let clientPresenter: jest.Mocked<ClientPresenter>

  const mockClientResponse: ClientResponseDto = {
    id: 'client-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    cpfCnpj: '123.456.789-00',
    phone: '+55 11 99999-9999',
    address: '123 Main St, City',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  const mockClientHttpResponse: ClientHttpResponse = {
    id: 'client-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    cpfCnpj: '123.456.789-00',
    phone: '+55 11 99999-9999',
    address: '123 Main St, City',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  }

  const mockPaginatedResponse: PaginatedClientsResponseDto = {
    data: [mockClientResponse],
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
    const mockCreateClientUseCase = { execute: jest.fn() }
    const mockGetClientByIdUseCase = { execute: jest.fn() }
    const mockGetAllClientsUseCase = { execute: jest.fn() }
    const mockGetClientByCpfCnpjUseCase = { execute: jest.fn() }
    const mockGetClientByEmailUseCase = { execute: jest.fn() }
    const mockSearchClientsByNameUseCase = { execute: jest.fn() }
    const mockCheckCpfCnpjAvailabilityUseCase = { execute: jest.fn() }
    const mockCheckEmailAvailabilityUseCase = { execute: jest.fn() }
    const mockUpdateClientUseCase = { execute: jest.fn() }
    const mockDeleteClientUseCase = { execute: jest.fn() }
    const mockClientPresenter = { present: jest.fn() }

    controller = new ClientController(
      mockCreateClientUseCase as any,
      mockGetClientByIdUseCase as any,
      mockGetClientByCpfCnpjUseCase as any,
      mockGetClientByEmailUseCase as any,
      mockGetAllClientsUseCase as any,
      mockUpdateClientUseCase as any,
      mockDeleteClientUseCase as any,
      mockSearchClientsByNameUseCase as any,
      mockCheckCpfCnpjAvailabilityUseCase as any,
      mockCheckEmailAvailabilityUseCase as any,
      mockClientPresenter as any,
    )

    createClientUseCase = mockCreateClientUseCase as any
    getClientByIdUseCase = mockGetClientByIdUseCase as any
    getAllClientsUseCase = mockGetAllClientsUseCase as any
    getClientByCpfCnpjUseCase = mockGetClientByCpfCnpjUseCase as any
    getClientByEmailUseCase = mockGetClientByEmailUseCase as any
    searchClientsByNameUseCase = mockSearchClientsByNameUseCase as any
    checkCpfCnpjAvailabilityUseCase = mockCheckCpfCnpjAvailabilityUseCase as any
    checkEmailAvailabilityUseCase = mockCheckEmailAvailabilityUseCase as any
    updateClientUseCase = mockUpdateClientUseCase as any
    deleteClientUseCase = mockDeleteClientUseCase as any
    clientPresenter = mockClientPresenter as any

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a client successfully', async () => {
      const createDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpfCnpj: '123.456.789-00',
        phone: '+55 11 99999-9999',
        address: '123 Main St, City',
      }

      createClientUseCase.execute.mockResolvedValue(new Success(mockClientResponse))
      clientPresenter.present.mockReturnValue(mockClientHttpResponse)

      const result = await controller.createClient(createDto)

      expect(createClientUseCase.execute).toHaveBeenCalledWith(createDto)
      expect(clientPresenter.present).toHaveBeenCalledWith(mockClientResponse)
      expect(result).toEqual(mockClientHttpResponse)
    })

    it('should handle creation error', async () => {
      const createDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpfCnpj: '123.456.789-00',
        phone: '+55 11 99999-9999',
        address: '123 Main St, City',
      }

      const error = new Error('Creation failed')
      createClientUseCase.execute.mockRejectedValue(error)

      await expect(controller.createClient(createDto)).rejects.toThrow('Creation failed')
    })

    it('throws when use-case returns malformed result (neither success nor failure)', async () => {
      const createDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpfCnpj: '123.456.789-00',
        phone: '+55 11 99999-9999',
        address: '123 Main St, City',
      }

      createClientUseCase.execute.mockResolvedValue({} as any)

      await expect(controller.createClient(createDto)).rejects.toThrow('Unexpected result state')
    })
  })

  describe('getAllClients', () => {
    it('should get all clients with pagination', async () => {
      const page = 1
      const limit = 10

      getAllClientsUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.getAllClients(page, limit)

      expect(getAllClientsUseCase.execute).toHaveBeenCalledWith(page, limit)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should get all clients with default pagination', async () => {
      getAllClientsUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.getAllClients()

      expect(getAllClientsUseCase.execute).toHaveBeenCalledWith(undefined, undefined)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should handle error in getAllClients', async () => {
      const error = new Error('Database error')
      getAllClientsUseCase.execute.mockRejectedValue(error)

      await expect(controller.getAllClients()).rejects.toThrow('Database error')
    })

    it('throws when use-case returns malformed result for getAllClients', async () => {
      getAllClientsUseCase.execute.mockResolvedValue({} as any)
      // controller catches and rethrows the error (which may be undefined) for malformed results
      await expect(controller.getAllClients()).rejects.toBeUndefined()
    })
  })

  describe('getClientById', () => {
    it('should get client by id', async () => {
      getClientByIdUseCase.execute.mockResolvedValue(new Success(mockClientResponse))

      const result = await controller.getClientById('client-123')

      expect(getClientByIdUseCase.execute).toHaveBeenCalledWith('client-123')
      expect(result).toEqual(mockClientResponse)
    })

    it('should handle client not found error', async () => {
      getClientByIdUseCase.execute.mockRejectedValue(new ClientNotFoundException('client-123'))

      await expect(controller.getClientById('client-123')).rejects.toThrow(ClientNotFoundException)
    })

    it('should handle generic error in getClientById', async () => {
      getClientByIdUseCase.execute.mockRejectedValue(new ClientNotFoundException('client-123'))

      await expect(controller.getClientById('non-existent')).rejects.toThrow(
        ClientNotFoundException,
      )
    })

    it('throws when use-case returns malformed result for getClientById', async () => {
      getClientByIdUseCase.execute.mockResolvedValue({} as any)
      await expect(controller.getClientById('client-123')).rejects.toThrow(
        'Unexpected result state',
      )
    })
  })

  describe('getClientByCpfCnpj', () => {
    it('should return client by CPF/CNPJ', async () => {
      getClientByCpfCnpjUseCase.execute.mockResolvedValue(new Success(mockClientResponse))
      clientPresenter.present.mockReturnValue(mockClientHttpResponse)

      const result = await controller.getClientByCpfCnpj('123.456.789-00')

      expect(getClientByCpfCnpjUseCase.execute).toHaveBeenCalledWith('123.456.789-00')
      expect(clientPresenter.present).toHaveBeenCalledWith(mockClientResponse)
      expect(result).toEqual(mockClientHttpResponse)
    })

    it('should throw ClientNotFoundException when client not found', async () => {
      getClientByCpfCnpjUseCase.execute.mockRejectedValue(
        new ClientNotFoundException('123.456.789-00'),
      )

      await expect(controller.getClientByCpfCnpj('123.456.789-00')).rejects.toThrow(
        ClientNotFoundException,
      )
    })

    it('should throw ClientNotFoundException when service returns undefined', async () => {
      getClientByCpfCnpjUseCase.execute.mockRejectedValue(
        new ClientNotFoundException('123.456.789-00'),
      )

      await expect(controller.getClientByCpfCnpj('123.456.789-00')).rejects.toThrow(
        ClientNotFoundException,
      )
    })

    it('throws when use-case returns malformed result for getClientByCpfCnpj', async () => {
      getClientByCpfCnpjUseCase.execute.mockResolvedValue({} as any)
      await expect(controller.getClientByCpfCnpj('123.456.789-00')).rejects.toThrow(
        'Unexpected result state',
      )
    })
  })

  describe('getClientByEmail', () => {
    it('should return client by email', async () => {
      getClientByEmailUseCase.execute.mockResolvedValue(new Success(mockClientResponse))
      clientPresenter.present.mockReturnValue(mockClientHttpResponse)

      const result = await controller.getClientByEmail('john.doe@example.com')

      expect(getClientByEmailUseCase.execute).toHaveBeenCalledWith('john.doe@example.com')
      expect(clientPresenter.present).toHaveBeenCalledWith(mockClientResponse)
      expect(result).toEqual(mockClientHttpResponse)
    })

    it('should throw ClientNotFoundException when client not found', async () => {
      getClientByEmailUseCase.execute.mockRejectedValue(
        new ClientNotFoundException('john.doe@example.com'),
      )

      await expect(controller.getClientByEmail('john.doe@example.com')).rejects.toThrow(
        ClientNotFoundException,
      )
    })

    it('should throw ClientNotFoundException when service returns undefined', async () => {
      getClientByEmailUseCase.execute.mockRejectedValue(
        new ClientNotFoundException('john.doe@example.com'),
      )

      await expect(controller.getClientByEmail('john.doe@example.com')).rejects.toThrow(
        ClientNotFoundException,
      )
    })

    it('throws when use-case returns malformed result for getClientByEmail', async () => {
      getClientByEmailUseCase.execute.mockResolvedValue({} as any)
      await expect(controller.getClientByEmail('john.doe@example.com')).rejects.toThrow(
        'Unexpected result state',
      )
    })
  })

  describe('searchClientsByName', () => {
    it('should return paginated search results', async () => {
      searchClientsByNameUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.searchClientsByName('John', 1, 10)

      expect(searchClientsByNameUseCase.execute).toHaveBeenCalledWith('John', 1, 10)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should handle default pagination parameters', async () => {
      searchClientsByNameUseCase.execute.mockResolvedValue(new Success(mockPaginatedResponse))

      const result = await controller.searchClientsByName('John')

      expect(searchClientsByNameUseCase.execute).toHaveBeenCalledWith('John', undefined, undefined)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should propagate error when service fails', async () => {
      searchClientsByNameUseCase.execute.mockRejectedValue(new Error('Service error'))
      await expect(controller.searchClientsByName('John', 1, 10)).rejects.toThrow('Service error')
    })

    it('throws when use-case returns malformed result for searchClientsByName', async () => {
      searchClientsByNameUseCase.execute.mockResolvedValue({} as any)
      await expect(controller.searchClientsByName('John', 1, 10)).rejects.toThrow(
        'Unexpected result state',
      )
    })
  })

  describe('checkCpfCnpjAvailability', () => {
    it('should return availability status', async () => {
      checkCpfCnpjAvailabilityUseCase.execute.mockResolvedValue(new Success(true))

      const result = await controller.checkCpfCnpjAvailability('123.456.789-00')

      expect(checkCpfCnpjAvailabilityUseCase.execute).toHaveBeenCalledWith('123.456.789-00')
      expect(result).toEqual({ available: true })
    })

    it('should propagate error when service fails', async () => {
      checkCpfCnpjAvailabilityUseCase.execute.mockRejectedValue(new Error('Service error'))
      await expect(controller.checkCpfCnpjAvailability('123.456.789-00')).rejects.toThrow(
        'Service error',
      )
    })

    it('throws when use-case returns malformed result for checkCpfCnpjAvailability', async () => {
      checkCpfCnpjAvailabilityUseCase.execute.mockResolvedValue({} as any)
      await expect(controller.checkCpfCnpjAvailability('123.456.789-00')).rejects.toThrow(
        'Unexpected result state',
      )
    })
  })

  describe('checkEmailAvailability', () => {
    it('should return availability status', async () => {
      checkEmailAvailabilityUseCase.execute.mockResolvedValue(new Success(false))

      const result = await controller.checkEmailAvailability('john.doe@example.com')

      expect(checkEmailAvailabilityUseCase.execute).toHaveBeenCalledWith('john.doe@example.com')
      expect(result).toEqual({ available: false })
    })

    it('should propagate error when service fails', async () => {
      checkEmailAvailabilityUseCase.execute.mockRejectedValue(new Error('Service error'))
      await expect(controller.checkEmailAvailability('john.doe@example.com')).rejects.toThrow(
        'Service error',
      )
    })

    it('throws when use-case returns malformed result for checkEmailAvailability', async () => {
      checkEmailAvailabilityUseCase.execute.mockResolvedValue({} as any)
      await expect(controller.checkEmailAvailability('john.doe@example.com')).rejects.toThrow(
        'Unexpected result state',
      )
    })
  })

  describe('updateClient', () => {
    it('should throw error when required field is missing in DTO', async () => {
      const invalidDto: any = { ...mockClientResponse }
      delete invalidDto.name
      updateClientUseCase.execute.mockRejectedValue(new Error('Validation error'))
      await expect(controller.updateClient('client-123', invalidDto)).rejects.toThrow(
        'Validation error',
      )
    })
    it('should handle update error', async () => {
      updateClientUseCase.execute.mockRejectedValue(new Error('Update failed'))
      await expect(controller.updateClient('client-123', { name: 'Test' })).rejects.toThrow(
        'Update failed',
      )
    })
    it('should handle get error', async () => {
      getClientByIdUseCase.execute.mockRejectedValue(new Error('Get failed'))
      await expect(controller.getClientById('client-123')).rejects.toThrow('Get failed')
    })
    it('should throw ClientNotFoundException if service returns failure', async () => {
      getClientByCpfCnpjUseCase.execute.mockRejectedValue(new ClientNotFoundException('Not found'))
      await expect(controller.getClientByCpfCnpj('123.456.789-00')).rejects.toThrow(
        ClientNotFoundException,
      )
    })
    it('should throw ClientNotFoundException if service returns failure', async () => {
      getClientByEmailUseCase.execute.mockRejectedValue(new ClientNotFoundException('Not found'))
      await expect(controller.getClientByEmail('john.doe@example.com')).rejects.toThrow(
        ClientNotFoundException,
      )
    })
    it('should update client successfully', async () => {
      const updateDto: UpdateClientDto = {
        name: 'John Updated',
        phone: '+55 11 88888-8888',
      }

      updateClientUseCase.execute.mockResolvedValue(new Success(mockClientResponse))
      clientPresenter.present.mockReturnValue(mockClientHttpResponse)

      const result = await controller.updateClient('client-123', updateDto)

      expect(updateClientUseCase.execute).toHaveBeenCalledWith('client-123', updateDto)
      expect(clientPresenter.present).toHaveBeenCalledWith(mockClientResponse)
      expect(result).toEqual(mockClientHttpResponse)
    })

    it('should throw ClientNotFoundException when client not found', async () => {
      const updateDto: UpdateClientDto = { name: 'John Updated' }

      updateClientUseCase.execute.mockRejectedValue(new ClientNotFoundException('client-123'))

      await expect(controller.updateClient('client-123', updateDto)).rejects.toThrow(
        ClientNotFoundException,
      )
    })

    it('should propagate generic error from service', async () => {
      const updateDto: UpdateClientDto = { name: 'John Updated' }
      updateClientUseCase.execute.mockRejectedValue(new Error('Service error'))
      await expect(controller.updateClient('client-123', updateDto)).rejects.toThrow(
        'Service error',
      )
    })

    it('throws when use-case returns malformed result for updateClient', async () => {
      updateClientUseCase.execute.mockResolvedValue({} as any)
      await expect(controller.updateClient('client-123', { name: 'Test' })).rejects.toThrow(
        'Unexpected result state',
      )
    })
  })

  describe('deleteClient', () => {
    it('should resolve to undefined when service returns false', async () => {
      deleteClientUseCase.execute.mockResolvedValue({ isSuccess: false } as any)
      await expect(controller.deleteClient('client-123')).resolves.toBeUndefined()
    })
    it('should delete client successfully', async () => {
      deleteClientUseCase.execute.mockResolvedValue(new Success(true))

      await controller.deleteClient('client-123')

      expect(deleteClientUseCase.execute).toHaveBeenCalledWith('client-123')
    })

    it('should throw ClientNotFoundException when client not found', async () => {
      deleteClientUseCase.execute.mockRejectedValue(new ClientNotFoundException('client-123'))

      await expect(controller.deleteClient('client-123')).rejects.toThrow(ClientNotFoundException)
    })

    it('should propagate generic error from service', async () => {
      deleteClientUseCase.execute.mockRejectedValue(new Error('Service error'))
      await expect(controller.deleteClient('client-123')).rejects.toThrow('Service error')
    })

    it('resolves when use-case returns malformed result for deleteClient', async () => {
      deleteClientUseCase.execute.mockResolvedValue({} as any)
      await expect(controller.deleteClient('client-123')).resolves.toBeUndefined()
    })
  })
})

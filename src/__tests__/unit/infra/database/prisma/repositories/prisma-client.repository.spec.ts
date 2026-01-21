import { Logger } from '@nestjs/common'
import { Client as PrismaClient } from '@prisma/client'

import { ClientFactory } from '@/__tests__/factories'
import { Client } from '@domain/clients/entities'
import { CpfCnpj } from '@domain/clients/value-objects'
import { PrismaClientRepository } from '@infra/database/prisma/repositories'
import { Email } from '@shared'

describe('PrismaClientRepository', () => {
  let repository: PrismaClientRepository
  let prismaService: any

  const mockPrismaClient: PrismaClient = {
    id: 'client-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    cpfCnpj: '111.444.777-35',
    phone: '+55 11 99999-9999',
    address: '123 Main St, City',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  beforeEach(async () => {
    const mockPrismaService = {
      client: {
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
    // pure-unit: instantiate repository directly with a mocked prisma client
    repository = new PrismaClientRepository(mockPrismaService as any)
    prismaService = mockPrismaService

    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findByCpfCnpj', () => {
    it('should find client by CPF/CNPJ successfully', async () => {
      const cpfCnpj = '111.444.777-35'
      const cleanCpfCnpj = new CpfCnpj(cpfCnpj).clean

      prismaService.client.findUnique.mockResolvedValue(mockPrismaClient)

      const result = await repository.findByCpfCnpj(cpfCnpj)

      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { cpfCnpj: cleanCpfCnpj },
      })
      expect(result).toBeInstanceOf(Client)
      expect(result?.id).toBe('client-123')
    })

    it('should return null when client not found', async () => {
      const cpfCnpj = '111.444.777-35'

      prismaService.client.findUnique.mockResolvedValue(null)

      const result = await repository.findByCpfCnpj(cpfCnpj)

      expect(result).toBeNull()
    })

    it('should throw error when CPF/CNPJ validation fails', async () => {
      const invalidCpfCnpj = 'invalid-cpf'

      await expect(repository.findByCpfCnpj(invalidCpfCnpj)).rejects.toThrow('Invalid value')
    })
  })

  describe('findByEmail', () => {
    it('should find client by email successfully', async () => {
      const email = 'john.doe@example.com'
      const normalizedEmail = new Email(email).normalized

      prismaService.client.findUnique.mockResolvedValue(mockPrismaClient)

      const result = await repository.findByEmail(email)

      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { email: normalizedEmail },
      })
      expect(result).toBeInstanceOf(Client)
      expect(result?.id).toBe('client-123')
    })

    it('should return null when client not found', async () => {
      const email = 'john.doe@example.com'

      prismaService.client.findUnique.mockResolvedValue(null)

      const result = await repository.findByEmail(email)

      expect(result).toBeNull()
    })

    it('should throw error when email validation fails', async () => {
      const invalidEmail = 'invalid-email'

      await expect(repository.findByEmail(invalidEmail)).rejects.toThrow()
    })
  })

  describe('cpfCnpjExists', () => {
    it('should return true when CPF/CNPJ exists', async () => {
      const cpfCnpj = '111.444.777-35'
      const cleanCpfCnpj = new CpfCnpj(cpfCnpj).clean

      prismaService.client.count.mockResolvedValue(1)

      const result = await repository.cpfCnpjExists(cpfCnpj)

      expect(prismaService.client.count).toHaveBeenCalledWith({
        where: { cpfCnpj: cleanCpfCnpj },
      })
      expect(result).toBe(true)
    })

    it('should return false when CPF/CNPJ does not exist', async () => {
      const cpfCnpj = '111.444.777-35'

      prismaService.client.count.mockResolvedValue(0)

      const result = await repository.cpfCnpjExists(cpfCnpj)

      expect(result).toBe(false)
    })

    it('should throw error when CPF/CNPJ is invalid', async () => {
      const invalid = 'invalid-cpf-cnpj'

      await expect(repository.cpfCnpjExists(invalid)).rejects.toThrow('Invalid value')
    })

    it('should rethrow when uniqueFieldExists fails internally', async () => {
      const cpfCnpj = '111.444.777-35'
      const internalError = new Error('Internal failure')
      jest.spyOn(repository as any, 'uniqueFieldExists').mockRejectedValueOnce(internalError)

      await expect(repository.cpfCnpjExists(cpfCnpj)).rejects.toThrow('Internal failure')
    })
  })

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      const email = 'john.doe@example.com'
      const normalizedEmail = new Email(email).normalized

      prismaService.client.count.mockResolvedValue(1)

      const result = await repository.emailExists(email)

      expect(prismaService.client.count).toHaveBeenCalledWith({
        where: { email: normalizedEmail },
      })
      expect(result).toBe(true)
    })

    it('should return false when email does not exist', async () => {
      const email = 'john.doe@example.com'

      prismaService.client.count.mockResolvedValue(0)

      const result = await repository.emailExists(email)

      expect(result).toBe(false)
    })

    it('should rethrow when uniqueFieldExists fails internally', async () => {
      const email = 'john.doe@example.com'
      const internalError = new Error('Internal failure')
      jest.spyOn(repository as any, 'uniqueFieldExists').mockRejectedValueOnce(internalError)

      await expect(repository.emailExists(email)).rejects.toThrow('Internal failure')
    })
  })

  describe('findByName', () => {
    it('should find clients by name with pagination', async () => {
      const name = 'John'
      const page = 1
      const limit = 10
      const mockClients = [mockPrismaClient]
      const totalCount = 1

      prismaService.client.findMany.mockResolvedValue(mockClients)
      prismaService.client.count.mockResolvedValue(totalCount)

      const result = await repository.findByName(name, page, limit)

      expect(prismaService.client.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: limit,
        orderBy: { name: 'asc' },
      })
      expect(prismaService.client.count).toHaveBeenCalledWith({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(totalCount)
      expect(result.meta.page).toBe(page)
      expect(result.meta.limit).toBe(limit)
    })

    it('should use default pagination when not provided', async () => {
      const name = 'John'

      prismaService.client.findMany.mockResolvedValue([])
      prismaService.client.count.mockResolvedValue(0)

      await repository.findByName(name)

      expect(prismaService.client.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      })
    })
  })

  describe('inherited methods', () => {
    it('should create client successfully', async () => {
      const client = ClientFactory.create()
      const createData = {
        name: client.name,
        email: client.email.normalized,
        cpfCnpj: client.cpfCnpj.clean,
        phone: client.phone ?? null,
        address: client.address ?? null,
      }

      prismaService.client.create.mockResolvedValue(mockPrismaClient)

      const result = await repository.create(client)

      expect(prismaService.client.create).toHaveBeenCalledWith({
        data: createData,
      })
      expect(result).toBeInstanceOf(Client)
    })

    it('should update client successfully', async () => {
      const client = ClientFactory.create({ id: 'client-123' })
      const updateData = {
        name: client.name,
        email: client.email.normalized,
        cpfCnpj: client.cpfCnpj.clean,
        phone: client.phone ?? null,
        address: client.address ?? null,
        updatedAt: expect.any(Date),
      }

      prismaService.client.update.mockResolvedValue(mockPrismaClient)

      const result = await repository.update(client.id, client)

      expect(prismaService.client.update).toHaveBeenCalledWith({
        where: { id: client.id },
        data: updateData,
      })
      expect(result).toBeInstanceOf(Client)
    })

    it('should delete client successfully', async () => {
      const clientId = 'client-123'

      prismaService.client.delete.mockResolvedValue(mockPrismaClient)

      const result = await repository.delete(clientId)

      expect(prismaService.client.delete).toHaveBeenCalledWith({
        where: { id: clientId },
      })
      expect(result).toBe(true)
    })

    it('should find client by id successfully', async () => {
      const clientId = 'client-123'

      prismaService.client.findUnique.mockResolvedValue(mockPrismaClient)

      const result = await repository.findById(clientId)

      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: clientId },
      })
      expect(result).toBeInstanceOf(Client)
    })

    it('should find all clients with pagination', async () => {
      const mockClients = [mockPrismaClient]
      const totalCount = 1

      prismaService.client.findMany.mockResolvedValue(mockClients)
      prismaService.client.count.mockResolvedValue(totalCount)

      const result = await repository.findAll(1, 10)

      expect(prismaService.client.findMany).toHaveBeenCalledWith({
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

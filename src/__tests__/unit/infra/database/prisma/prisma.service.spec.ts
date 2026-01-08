import { INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'

import { PrismaService } from '@infra/database/prisma/prisma.service'
import { RetryService } from '@shared/services'

import { sharedMockLogger } from '../../../../factories/setup'

// Harden tests: ensure any underlying PrismaClient methods are stubbed at the
// prototype level so creating a PrismaService instance cannot trigger a real
// connection or query if tests are modified later.
jest.spyOn(PrismaService.prototype, '$connect').mockResolvedValue(undefined)
jest.spyOn(PrismaService.prototype, '$disconnect').mockResolvedValue(undefined)
jest
  .spyOn(PrismaService.prototype, '$transaction')
  .mockImplementation(async (fn: (p: PrismaClient) => Promise<unknown>) => {
    // Provide a minimal fake transaction client to the passed fn to keep it
    // isolated from real DB internals during tests.
    const tx = {} as unknown as PrismaClient
    return (fn as any)(tx)
  })
jest.spyOn(PrismaService.prototype, '$queryRaw').mockResolvedValue([{ '1': 1 }])

describe('PrismaService', () => {
  let service: PrismaService
  let mockApp: DeepMockProxy<INestApplication>
  let retryService: DeepMockProxy<RetryService>

  beforeEach(async () => {
    const mockNestApp = mockDeep<INestApplication>()
    const mockRetryService = mockDeep<RetryService>()
    const mockConfigService = mockDeep<ConfigService>()
    mockConfigService.get.mockReturnValue('postgresql://test:test@localhost:5432/test')

    mockRetryService.withRetry.mockImplementation(async (fn) => {
      return fn()
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: Logger,
          useValue: sharedMockLogger,
        },
        {
          provide: RetryService,
          useValue: mockRetryService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<PrismaService>(PrismaService)
    retryService = module.get(RetryService)
    mockApp = mockNestApp

    jest.spyOn(service, '$connect').mockResolvedValue(undefined)
    jest.spyOn(service, '$disconnect').mockResolvedValue(undefined)
    jest.spyOn(service, '$transaction').mockImplementation(async (fn) => {
      return fn(service)
    })
    jest.spyOn(service, '$queryRaw').mockResolvedValue([{ '1': 1 }])

    jest.spyOn(service['logger'], 'log').mockImplementation(sharedMockLogger.log)
    jest.spyOn(service['logger'], 'error').mockImplementation(sharedMockLogger.error)
    jest.spyOn(service['logger'], 'debug').mockImplementation(sharedMockLogger.debug)
    jest.spyOn(service['logger'], 'warn').mockImplementation(sharedMockLogger.warn)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('onModuleInit', () => {
    it('should connect to database successfully', async () => {
      await service.onModuleInit()

      expect(service['logger'].log).toHaveBeenCalledWith(
        'Connecting to database with retry logic...',
      )
      expect(retryService.withRetry).toHaveBeenCalled()
      expect(service.$connect).toHaveBeenCalled()
      expect(service['logger'].log).toHaveBeenCalledWith('Successfully connected to database')
    })

    it('should handle connection errors', async () => {
      const connectionError = new Error('Connection failed')
      jest.spyOn(service, '$connect').mockRejectedValue(connectionError)
      retryService.withRetry.mockRejectedValue(connectionError)

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed')

      expect(service['logger'].log).toHaveBeenCalledWith(
        'Connecting to database with retry logic...',
      )
      expect(retryService.withRetry).toHaveBeenCalled()
      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to connect to database after retries',
        {
          error: 'Connection failed',
        },
      )
    })

    it('should handle non-Error connection failures', async () => {
      const connectionError = 'Connection string invalid'
      jest.spyOn(service, '$connect').mockRejectedValue(connectionError)
      retryService.withRetry.mockRejectedValue(connectionError)

      await expect(service.onModuleInit()).rejects.toBe('Connection string invalid')

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to connect to database after retries',
        {
          error: 'Connection string invalid',
        },
      )
    })
  })

  describe('onModuleDestroy', () => {
    it('should disconnect from database successfully', async () => {
      await service.onModuleDestroy()

      expect(service['logger'].log).toHaveBeenCalledWith('Disconnecting from database...')
      expect(service.$disconnect).toHaveBeenCalled()
      expect(service['logger'].log).toHaveBeenCalledWith('Successfully disconnected from database')
    })

    it('should handle disconnection errors', async () => {
      const disconnectionError = new Error('Disconnection failed')
      jest.spyOn(service, '$disconnect').mockRejectedValue(disconnectionError)

      await expect(service.onModuleDestroy()).rejects.toThrow('Disconnection failed')

      expect(service['logger'].log).toHaveBeenCalledWith('Disconnecting from database...')
      expect(service.$disconnect).toHaveBeenCalled()
      expect(service['logger'].error).toHaveBeenCalledWith('Failed to disconnect from database', {
        error: 'Disconnection failed',
      })
    })

    it('should handle non-Error disconnection failures', async () => {
      const disconnectionError = 'Database locked'
      jest.spyOn(service, '$disconnect').mockRejectedValue(disconnectionError)

      await expect(service.onModuleDestroy()).rejects.toBe('Database locked')

      expect(service['logger'].error).toHaveBeenCalledWith('Failed to disconnect from database', {
        error: 'Database locked',
      })
    })
  })

  describe('enableShutdownHooks', () => {
    it('should enable shutdown hooks successfully', () => {
      const processSpy = jest.spyOn(process, 'on').mockImplementation(() => process)

      service.enableShutdownHooks(mockApp)

      expect(service['logger'].log).toHaveBeenCalledWith('Enabling shutdown hooks...')
      expect(processSpy).toHaveBeenCalledWith('beforeExit', expect.any(Function))

      processSpy.mockRestore()
    })

    it('should call app.close when beforeExit event is triggered', () => {
      const processSpy = jest.spyOn(process, 'on').mockImplementation((event, callback) => {
        if (event === 'beforeExit') {
          callback()
        }
        return process
      })

      service.enableShutdownHooks(mockApp)

      expect(service['logger'].log).toHaveBeenCalledWith(
        'Application shutting down, closing database connection...',
      )
      expect(mockApp.close).toHaveBeenCalled()

      processSpy.mockRestore()
    })
  })

  describe('transaction', () => {
    it('should execute transaction successfully', async () => {
      const mockTransactionFn = jest.fn().mockResolvedValue('transaction result')
      const transactionSpy = jest
        .spyOn(service, '$transaction')
        .mockResolvedValue('transaction result')

      const result = await service.transaction(mockTransactionFn)

      expect(service['logger'].debug).toHaveBeenCalledWith('Starting database transaction')
      expect(transactionSpy).toHaveBeenCalledWith(mockTransactionFn)
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Database transaction completed successfully',
      )
      expect(result).toBe('transaction result')

      transactionSpy.mockRestore()
    })

    it('should handle transaction errors', async () => {
      const transactionError = new Error('Transaction failed')
      const mockTransactionFn = jest.fn().mockRejectedValue(transactionError)
      const transactionSpy = jest.spyOn(service, '$transaction').mockRejectedValue(transactionError)

      await expect(service.transaction(mockTransactionFn)).rejects.toThrow('Transaction failed')

      expect(service['logger'].debug).toHaveBeenCalledWith('Starting database transaction')
      expect(transactionSpy).toHaveBeenCalledWith(mockTransactionFn)
      expect(service['logger'].error).toHaveBeenCalledWith('Database transaction failed', {
        error: 'Transaction failed',
      })

      transactionSpy.mockRestore()
    })

    it('should handle non-Error transaction failures', async () => {
      const transactionError = 'Constraint violation'
      const mockTransactionFn = jest.fn().mockRejectedValue(transactionError)
      const transactionSpy = jest.spyOn(service, '$transaction').mockRejectedValue(transactionError)

      await expect(service.transaction(mockTransactionFn)).rejects.toBe('Constraint violation')

      expect(service['logger'].error).toHaveBeenCalledWith('Database transaction failed', {
        error: 'Constraint violation',
      })

      transactionSpy.mockRestore()
    })

    it('should handle complex transaction with multiple operations', async () => {
      const txMock = {
        clients: { create: jest.fn().mockResolvedValue({ id: 1, name: 'test' }) },
        vehicles: { create: jest.fn().mockResolvedValue({ id: 2, clientId: 1 }) },
      }
      const mockTransactionFn = jest.fn().mockImplementation(async () => {
        const client = (await txMock.clients.create({ data: { name: 'test' } })) as unknown as {
          id: number
        }
        const vehicle = (await txMock.vehicles.create({
          data: { clientId: client.id },
        })) as unknown as {
          id: number
          clientId: number
        }
        return { client, vehicle }
      })

      const transactionSpy = jest.spyOn(service, '$transaction').mockImplementation(async (fn) => {
        return fn(txMock as unknown as PrismaClient)
      })

      const result = await service.transaction(mockTransactionFn)

      expect(service['logger'].debug).toHaveBeenCalledWith('Starting database transaction')
      expect(transactionSpy).toHaveBeenCalledWith(mockTransactionFn)
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Database transaction completed successfully',
      )
      expect(result).toEqual({
        client: { id: 1, name: 'test' },
        vehicle: { id: 2, clientId: 1 },
      })

      transactionSpy.mockRestore()
    })
  })

  describe('healthCheck', () => {
    it('should return true when health check passes', async () => {
      const result = await service.healthCheck()

      expect(service['logger'].debug).toHaveBeenCalledWith('Performing database health check')
      expect(service.$queryRaw).toHaveBeenCalledWith(['SELECT 1'])
      expect(service['logger'].debug).toHaveBeenCalledWith('Database health check passed')
      expect(result).toBe(true)
    })

    it('should return false when health check fails', async () => {
      const healthCheckError = new Error('Database connection failed')
      jest.spyOn(service, '$queryRaw').mockRejectedValue(healthCheckError)

      const result = await service.healthCheck()

      expect(service['logger'].debug).toHaveBeenCalledWith('Performing database health check')
      expect(service.$queryRaw).toHaveBeenCalledWith(['SELECT 1'])
      expect(service['logger'].error).toHaveBeenCalledWith('Database health check failed', {
        error: 'Database connection failed',
      })
      expect(result).toBe(false)
    })

    it('should handle non-Error health check failures', async () => {
      const healthCheckError = 'Database timeout'
      jest.spyOn(service, '$queryRaw').mockRejectedValue(healthCheckError)

      const result = await service.healthCheck()

      expect(service['logger'].error).toHaveBeenCalledWith('Database health check failed', {
        error: 'Database timeout',
      })
      expect(result).toBe(false)
    })

    it('should handle empty health check response', async () => {
      jest.spyOn(service, '$queryRaw').mockResolvedValue([])

      const result = await service.healthCheck()

      expect(service['logger'].debug).toHaveBeenCalledWith('Database health check passed')
      expect(result).toBe(true)
    })
  })

  describe('integration scenarios', () => {
    it('should handle full lifecycle: init -> health check -> transaction -> destroy', async () => {
      await service.onModuleInit()
      expect(retryService.withRetry).toHaveBeenCalled()

      const isHealthy = await service.healthCheck()
      expect(isHealthy).toBe(true)

      const mockTransactionFn = jest.fn().mockResolvedValue('test result')
      const result = await service.transaction(mockTransactionFn)
      expect(result).toBe('test result')

      await service.onModuleDestroy()
      expect(service.$disconnect).toHaveBeenCalled()
    })

    it('should handle shutdown hooks with full lifecycle', async () => {
      const processSpy = jest.spyOn(process, 'on').mockImplementation(() => process)

      await service.onModuleInit()

      service.enableShutdownHooks(mockApp)

      const isHealthy = await service.healthCheck()
      expect(isHealthy).toBe(true)

      const beforeExitCallback = processSpy.mock.calls.find(
        (call) => call[0] === 'beforeExit',
      )?.[1] as () => void
      if (beforeExitCallback) {
        beforeExitCallback()
      }

      expect(mockApp.close).toHaveBeenCalled()

      processSpy.mockRestore()
    })
  })
})

import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { sharedMockLogger } from '@/__tests__/factories/setup'
import { RetryService, RetryableError } from '@shared/services'

describe('RetryService', () => {
  let service: RetryService
  let logger: jest.Mocked<Logger> = sharedMockLogger as unknown as jest.Mocked<Logger>

  const createService = (
    configValues: { initialDelay?: number; maxDelay?: number; maxAttempts?: number } = {},
  ) => {
    const mockConfig = {
      get: jest.fn().mockImplementation((key: string, defaultValue: number) => {
        if (key === 'retry.backoff.initialDelay') {
          return configValues.initialDelay ?? defaultValue
        }
        if (key === 'retry.backoff.maxDelay') {
          return configValues.maxDelay ?? defaultValue
        }
        if (key === 'retry.backoff.maxAttempts') {
          return configValues.maxAttempts ?? defaultValue
        }
        return defaultValue
      }),
    } as unknown as ConfigService<Record<string | symbol, unknown>, false>

    return {
      service: new RetryService(mockConfig),
      mockConfigService: mockConfig,
      logger: logger,
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: sharedMockLogger,
        },
      ],
    }).compile()

    service = module.get<RetryService>(RetryService)
    logger = module.get(Logger) as any
    jest.spyOn(Logger.prototype, 'error').mockImplementation(sharedMockLogger.error)
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(sharedMockLogger.warn)
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(sharedMockLogger.debug)
    jest.spyOn(Logger.prototype, 'log').mockImplementation(sharedMockLogger.log)
  })

  describe('constructor', () => {
    it('initializes with default configuration when no config is provided', () => {
      const { mockConfigService } = createService()

      expect(mockConfigService.get).toHaveBeenCalledWith('retry.backoff.initialDelay', 1000)
      expect(mockConfigService.get).toHaveBeenCalledWith('retry.backoff.maxDelay', 30000)
      expect(mockConfigService.get).toHaveBeenCalledWith('retry.backoff.maxAttempts', 3)
    })

    it('logs warning and uses default when invalid initialDelay is provided', () => {
      const { logger } = createService({ initialDelay: -100 })

      expect(logger.warn).toHaveBeenCalledWith(
        'Invalid configuration value for retry.backoff.initialDelay. Using default: 1000',
      )
    })

    it('logs warning and uses default when invalid maxDelay is provided', () => {
      const { logger } = createService({ maxDelay: 0 })

      expect(logger.warn).toHaveBeenCalledWith(
        'Invalid configuration value for retry.backoff.maxDelay. Using default: 30000',
      )
    })

    it('logs warning and uses default when invalid maxAttempts is provided', () => {
      const { logger } = createService({ maxAttempts: -1 })

      expect(logger.warn).toHaveBeenCalledWith(
        'Invalid configuration value for retry.backoff.maxAttempts. Using default: 3',
      )
    })

    it('throws error when maxDelay is less than initialDelay', () => {
      expect(() => createService({ initialDelay: 5000, maxDelay: 1000 })).toThrow(
        'maxDelay must be greater than or equal to initialDelay',
      )
    })
  })

  describe('RetryableError', () => {
    it('creates RetryableError with message and cause', () => {
      const originalError = new Error('Original error')
      const retryableError = new RetryableError('Retryable operation failed', originalError)

      expect(retryableError.message).toBe('Retryable operation failed')
      expect(retryableError.cause).toBe(originalError)
      expect(retryableError.name).toBe('RetryableError')
    })

    it('creates RetryableError without cause', () => {
      const retryableError = new RetryableError('Retryable operation failed')

      expect(retryableError.message).toBe('Retryable operation failed')
      expect(retryableError.cause).toBeUndefined()
      expect(retryableError.name).toBe('RetryableError')
    })
  })

  describe('withRetry', () => {
    beforeEach(() => {
      const created = createService({ initialDelay: 100, maxDelay: 1000, maxAttempts: 3 })
      service = created.service
      logger = created.logger as any
    })

    describe('successful operations', () => {
      it('executes operation successfully on first attempt', async () => {
        const mockFunction = jest.fn().mockResolvedValue('success')

        const result = await service.withRetry(mockFunction)

        expect(result).toBe('success')
        expect(mockFunction).toHaveBeenCalledTimes(1)
        expect(logger.error).not.toHaveBeenCalled()
      })

      it('handles async operations', async () => {
        const mockAsyncFunction = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return 'async success'
        })

        const result = await service.withRetry(mockAsyncFunction)

        expect(result).toBe('async success')
        expect(mockAsyncFunction).toHaveBeenCalledTimes(1)
      })

      it('handles functions that return non-promise values', async () => {
        const mockFunction = jest.fn().mockReturnValue('sync success')

        const result = await service.withRetry(mockFunction)

        expect(result).toBe('sync success')
        expect(mockFunction).toHaveBeenCalledTimes(1)
      })
    })

    describe('retry scenarios', () => {
      it('retries operation on failure and succeeds with retryable error message', async () => {
        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(new Error('Network timeout'))
          .mockResolvedValueOnce('success')

        const result = await service.withRetry(mockFunction)

        expect(result).toBe('success')
        expect(mockFunction).toHaveBeenCalledTimes(2)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: Network timeout',
          expect.objectContaining({
            error: 'Network timeout',
            attempt: 1,
            delayMs: 100,
            nextAttempt: 2,
          }),
        )
      })

      it('retries operation on failure and succeeds with RetryableError instance', async () => {
        const retryableError = new RetryableError('Custom retryable error')
        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(retryableError)
          .mockResolvedValueOnce('success')

        const result = await service.withRetry(mockFunction)

        expect(result).toBe('success')
        expect(mockFunction).toHaveBeenCalledTimes(2)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: Custom retryable error',
          expect.objectContaining({
            error: 'Custom retryable error',
            attempt: 1,
            delayMs: 100,
            nextAttempt: 2,
          }),
        )
      })

      it('retries with exponential backoff using retryable error messages', async () => {
        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(new Error('Network timeout'))
          .mockRejectedValueOnce(new Error('Connection reset'))
          .mockResolvedValueOnce('success')

        const result = await service.withRetry(mockFunction)

        expect(result).toBe('success')
        expect(mockFunction).toHaveBeenCalledTimes(3)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: Network timeout',
          expect.objectContaining({ delayMs: 100 }),
        )
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 2 failed. Retrying in 200ms: Connection reset',
          expect.objectContaining({ delayMs: 200 }),
        )
      })

      it('retries with exponential backoff using RetryableError instances', async () => {
        const retryableError1 = new RetryableError('First retryable error')
        const retryableError2 = new RetryableError('Second retryable error')
        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(retryableError1)
          .mockRejectedValueOnce(retryableError2)
          .mockResolvedValueOnce('success')

        const result = await service.withRetry(mockFunction)

        expect(result).toBe('success')
        expect(mockFunction).toHaveBeenCalledTimes(3)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: First retryable error',
          expect.objectContaining({ delayMs: 100 }),
        )
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 2 failed. Retrying in 200ms: Second retryable error',
          expect.objectContaining({ delayMs: 200 }),
        )
      })

      it('applies delay between retries for retryable error messages', async () => {
        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(new Error('Network timeout'))
          .mockResolvedValueOnce('success')

        const startTime = Date.now()
        await service.withRetry(mockFunction)
        const endTime = Date.now()

        expect(endTime - startTime).toBeGreaterThanOrEqual(100)
        expect(mockFunction).toHaveBeenCalledTimes(2)
      })

      it('applies delay between retries for RetryableError instances', async () => {
        const retryableError = new RetryableError('Retryable operation failed')
        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(retryableError)
          .mockResolvedValueOnce('success')

        const startTime = Date.now()
        await service.withRetry(mockFunction)
        const endTime = Date.now()

        expect(endTime - startTime).toBeGreaterThanOrEqual(100)
        expect(mockFunction).toHaveBeenCalledTimes(2)
      })

      it('respects maxDelay cap for retryable error messages', async () => {
        const newService = new RetryService({
          get: jest.fn().mockImplementation((key: string) => {
            if (key === 'retry.backoff.initialDelay') return 100
            if (key === 'retry.backoff.maxDelay') return 150
            if (key === 'retry.backoff.maxAttempts') return 2
            return undefined
          }),
        } as unknown as ConfigService<Record<string | symbol, unknown>, false>)

        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(new Error('Network timeout'))
          .mockRejectedValueOnce(new Error('Connection reset'))

        await expect(newService.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(2)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: Network timeout',
          expect.objectContaining({ delayMs: 100 }),
        )
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 2 attempts: Connection reset',
          expect.objectContaining({ attempt: 2 }),
        )
      })

      it('respects maxDelay cap for RetryableError instances', async () => {
        const newService = new RetryService({
          get: jest.fn().mockImplementation((key: string) => {
            if (key === 'retry.backoff.initialDelay') return 100
            if (key === 'retry.backoff.maxDelay') return 150
            if (key === 'retry.backoff.maxAttempts') return 2
            return undefined
          }),
        } as unknown as ConfigService<Record<string | symbol, unknown>, false>)

        const retryableError1 = new RetryableError('First retryable error')
        const retryableError2 = new RetryableError('Second retryable error')
        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(retryableError1)
          .mockRejectedValueOnce(retryableError2)

        await expect(newService.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(2)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: First retryable error',
          expect.objectContaining({ delayMs: 100 }),
        )
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 2 attempts: Second retryable error',
          expect.objectContaining({ attempt: 2 }),
        )
      })
    })

    describe('failure scenarios', () => {
      it('throws RetryableError after max attempts with retryable error messages', async () => {
        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(new Error('Network timeout'))
          .mockRejectedValueOnce(new Error('Connection reset'))
          .mockRejectedValueOnce(new Error('Service unavailable'))

        await expect(service.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(3)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: Network timeout',
          expect.objectContaining({ delayMs: 100 }),
        )
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 2 failed. Retrying in 200ms: Connection reset',
          expect.objectContaining({ delayMs: 200 }),
        )
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 3 attempts: Service unavailable',
          expect.objectContaining({ attempt: 3 }),
        )
      })

      it('throws RetryableError after max attempts with RetryableError instances', async () => {
        const retryableError1 = new RetryableError('First retryable error')
        const retryableError2 = new RetryableError('Second retryable error')
        const retryableError3 = new RetryableError('Third retryable error')
        const mockFunction = jest
          .fn()
          .mockRejectedValueOnce(retryableError1)
          .mockRejectedValueOnce(retryableError2)
          .mockRejectedValueOnce(retryableError3)

        await expect(service.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(3)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: First retryable error',
          expect.objectContaining({ delayMs: 100 }),
        )
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 2 failed. Retrying in 200ms: Second retryable error',
          expect.objectContaining({ delayMs: 200 }),
        )
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 3 attempts: Third retryable error',
          expect.objectContaining({ attempt: 3 }),
        )
      })

      it('does not retry non-retryable errors (validation error)', async () => {
        const mockFunction = jest.fn().mockRejectedValue(new Error('Validation error'))

        await expect(service.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(1)
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 1 attempts: Validation error',
          expect.objectContaining({
            attempt: 1,
            maxAttempts: 3,
            isRetryable: false,
          }),
        )
      })

      it('does not retry non-retryable errors (business logic error)', async () => {
        const mockFunction = jest.fn().mockRejectedValue(new Error('Business rule violation'))

        await expect(service.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(1)
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 1 attempts: Business rule violation',
          expect.objectContaining({
            attempt: 1,
            maxAttempts: 3,
            isRetryable: false,
          }),
        )
      })

      it('retries RetryableError instances up to max attempts', async () => {
        const retryableError = new RetryableError('Custom retryable error')
        const mockFunction = jest.fn().mockRejectedValue(retryableError)

        await expect(service.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(3)
      })

      it('handles functions that throw synchronous errors (non-retryable)', async () => {
        const mockFunction = jest.fn().mockImplementation(() => {
          throw new Error('Sync error')
        })

        await expect(service.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(1)
      })

      it('handles functions that throw synchronous retryable errors', async () => {
        const mockFunction = jest.fn().mockImplementation(() => {
          throw new Error('Network timeout')
        })

        await expect(service.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(3)
      })

      it('handles operations that throw non-Error objects (non-retryable)', async () => {
        const mockFunction = jest.fn().mockRejectedValue('String error')

        await expect(service.withRetry(mockFunction)).rejects.toThrow(RetryableError)
        expect(mockFunction).toHaveBeenCalledTimes(1)
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 1 attempts: String error',
          expect.objectContaining({
            attempt: 1,
            maxAttempts: 3,
            isRetryable: false,
          }),
        )
      })
    })

    describe('retryable error detection', () => {
      it('retries on ECONNRESET error message', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('ECONNRESET'))
          .mockResolvedValueOnce('success')

        await service.withRetry(operation)

        expect(operation).toHaveBeenCalledTimes(2)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: ECONNRESET',
          expect.any(Object),
        )
      })

      it('retries on ETIMEDOUT error message', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('ETIMEDOUT'))
          .mockResolvedValueOnce('success')

        await service.withRetry(operation)

        expect(operation).toHaveBeenCalledTimes(2)
      })

      it('retries on ENOTFOUND error message', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('ENOTFOUND'))
          .mockResolvedValueOnce('success')

        await service.withRetry(operation)

        expect(operation).toHaveBeenCalledTimes(2)
      })

      it('retries on ECONNREFUSED error message', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('ECONNREFUSED'))
          .mockResolvedValueOnce('success')

        await service.withRetry(operation)

        expect(operation).toHaveBeenCalledTimes(2)
      })

      it('retries on timeout error message', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('Request timeout'))
          .mockResolvedValueOnce('success')

        await service.withRetry(operation)

        expect(operation).toHaveBeenCalledTimes(2)
      })

      it('retries on network error message', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('Network error occurred'))
          .mockResolvedValueOnce('success')

        await service.withRetry(operation)

        expect(operation).toHaveBeenCalledTimes(2)
      })

      it('retries on temporary error message', async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error('Temporary service unavailable'))
          .mockResolvedValueOnce('success')

        await service.withRetry(operation)

        expect(operation).toHaveBeenCalledTimes(2)
      })

      it('retries on RetryableError instance', async () => {
        const retryableError = new RetryableError('Custom retryable error')
        const operation = jest
          .fn()
          .mockRejectedValueOnce(retryableError)
          .mockResolvedValueOnce('success')

        await service.withRetry(operation)

        expect(operation).toHaveBeenCalledTimes(2)
        expect(logger.warn).toHaveBeenCalledWith(
          'Attempt 1 failed. Retrying in 100ms: Custom retryable error',
          expect.any(Object),
        )
      })

      it('does not retry on validation error message', async () => {
        const operation = jest.fn().mockRejectedValueOnce(new Error('Validation failed'))

        await expect(service.withRetry(operation)).rejects.toThrow(RetryableError)

        expect(operation).toHaveBeenCalledTimes(1)
      })

      it('does not retry on business logic error message', async () => {
        const operation = jest.fn().mockRejectedValueOnce(new Error('Business rule violation'))

        await expect(service.withRetry(operation)).rejects.toThrow(RetryableError)

        expect(operation).toHaveBeenCalledTimes(1)
      })

      it('does not retry on generic error message', async () => {
        const operation = jest.fn().mockRejectedValueOnce(new Error('Something went wrong'))

        await expect(service.withRetry(operation)).rejects.toThrow(RetryableError)

        expect(operation).toHaveBeenCalledTimes(1)
      })
    })

    describe('edge cases', () => {
      it('handles operation that throws undefined', async () => {
        const operation = jest.fn().mockRejectedValueOnce(undefined)

        await expect(service.withRetry(operation)).rejects.toThrow(RetryableError)

        expect(operation).toHaveBeenCalledTimes(1)
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 1 attempts: undefined',
          expect.any(Object),
        )
      })

      it('handles operation that throws null', async () => {
        const operation = jest.fn().mockRejectedValueOnce(null)

        await expect(service.withRetry(operation)).rejects.toThrow(RetryableError)

        expect(operation).toHaveBeenCalledTimes(1)
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 1 attempts: null',
          expect.any(Object),
        )
      })

      it('handles operation that throws number', async () => {
        const operation = jest.fn().mockRejectedValueOnce(500)

        await expect(service.withRetry(operation)).rejects.toThrow(RetryableError)

        expect(operation).toHaveBeenCalledTimes(1)
        expect(logger.error).toHaveBeenCalledWith(
          'Operation failed after 1 attempts: 500',
          expect.any(Object),
        )
      })
    })
  })
})

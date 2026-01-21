import { Logger } from '@nestjs/common'

import { sharedMockLogger } from '@/__tests__/factories/setup'
import { InMemoryMetricsBackend, MetricsService, PromClientMetricsBackend } from '@shared/services'

describe('MetricsService', () => {
  let service: MetricsService
  let inMemoryBackend: InMemoryMetricsBackend

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(sharedMockLogger.error)
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(sharedMockLogger.warn)
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(sharedMockLogger.debug)
    jest.spyOn(Logger.prototype, 'log').mockImplementation(sharedMockLogger.log)

    inMemoryBackend = new InMemoryMetricsBackend()
    service = new MetricsService(inMemoryBackend, {
      enabled: true,
      collectHistograms: true,
      collectMeanTimes: true,
      logLevel: 'debug',
      defaultLabels: {},
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('InMemoryMetricsBackend', () => {
    let backend: InMemoryMetricsBackend

    beforeEach(() => {
      backend = new InMemoryMetricsBackend()
    })

    describe('increment', () => {
      it('increments by default value', async () => {
        backend.increment('test_counter')
        const metrics = JSON.parse((await backend.getMetrics()) as unknown as string)
        expect(metrics.counters.test_counter).toBe(1)
      })

      it('increments by specified value and accumulates', async () => {
        backend.increment('test_counter', 3)
        backend.increment('test_counter', 2)
        const metrics = JSON.parse((await backend.getMetrics()) as unknown as string)
        expect(metrics.counters.test_counter).toBe(5)
      })
    })

    describe('observe', () => {
      it('observes histogram values', async () => {
        backend.observe('test_histogram', 1.5)
        backend.observe('test_histogram', 2.5)
        const metrics = JSON.parse((await backend.getMetrics()) as unknown as string)
        expect(metrics.histograms.test_histogram).toEqual([1.5, 2.5])
      })
    })

    describe('gauge', () => {
      it('sets and updates gauge value', async () => {
        backend.gauge('test_gauge', 10.5)
        backend.gauge('test_gauge', 20.5)
        const metrics = JSON.parse((await backend.getMetrics()) as unknown as string)
        expect(metrics.gauges.test_gauge).toBe(20.5)
      })
    })

    describe('getMetrics', () => {
      it('returns formatted metrics string and handles empty', async () => {
        const empty = JSON.parse((await backend.getMetrics()) as unknown as string)
        expect(empty.counters).toEqual({})
        expect(empty.histograms).toEqual({})
        expect(empty.gauges).toEqual({})

        backend.increment('test_counter', 5)
        backend.observe('test_histogram', 1.5)
        backend.gauge('test_gauge', 10.5)
        const metrics = JSON.parse((await backend.getMetrics()) as unknown as string)
        expect(metrics.counters.test_counter).toBe(5)
        expect(metrics.histograms.test_histogram).toEqual([1.5])
        expect(metrics.gauges.test_gauge).toBe(10.5)
      })
    })
  })

  describe('PromClientMetricsBackend', () => {
    let backend: PromClientMetricsBackend
    let mockPromClient: any

    beforeEach(() => {
      mockPromClient = {
        Registry: jest.fn().mockImplementation(() => ({
          registerMetric: jest.fn(),
          metrics: jest.fn().mockResolvedValue('mock metrics'),
        })),
        Counter: jest.fn().mockImplementation(() => ({
          inc: jest.fn(),
        })),
        Histogram: jest.fn().mockImplementation(() => ({
          observe: jest.fn(),
        })),
        collectDefaultMetrics: jest.fn(),
      }

      backend = new PromClientMetricsBackend(mockPromClient)
    })

    describe('increment', () => {
      it('increments counter successfully', () => {
        expect(() => backend.increment('test_counter')).not.toThrow()
      })

      it('handles increment errors gracefully', () => {
        mockPromClient.Counter.mockImplementation(() => {
          throw new Error('Counter creation failed')
        })

        expect(() => backend.increment('test_counter')).not.toThrow()
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to increment metric', {
          name: 'test_counter',
          value: 1,
          error: 'Counter creation failed',
        })
      })
    })

    describe('observe', () => {
      it('observes histogram successfully', () => {
        expect(() => backend.observe('test_histogram', 1.5)).not.toThrow()
      })

      it('handles observe errors gracefully', () => {
        mockPromClient.Histogram.mockImplementation(() => {
          throw new Error('Histogram creation failed')
        })

        expect(() => backend.observe('test_histogram', 1.5)).not.toThrow()
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to observe metric', {
          name: 'test_histogram',
          value: 1.5,
          error: 'Histogram creation failed',
        })
      })
    })

    describe('getMetrics', () => {
      it('returns metrics successfully', async () => {
        const metrics = await backend.getMetrics()
        expect(metrics).toBe('mock metrics')
      })

      it('handles getMetrics errors gracefully', async () => {
        mockPromClient.Registry.mockImplementation(() => ({
          registerMetric: jest.fn(),
          metrics: jest.fn().mockRejectedValue(new Error('Metrics failed')),
        }))

        const backendWithError = new PromClientMetricsBackend(mockPromClient)
        const metrics = await backendWithError.getMetrics()
        expect(metrics).toBe('# Error collecting metrics\n')
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to get metrics', {
          error: 'Metrics failed',
        })
      })

      it('returns no registry message when registry has no metrics method', async () => {
        mockPromClient.Registry.mockImplementation(() => ({
          registerMetric: jest.fn(),
        }))

        const backendWithoutRegistry = new PromClientMetricsBackend(mockPromClient)
        const metrics = await backendWithoutRegistry.getMetrics()
        expect(metrics).toBe('# No metrics registry available\n')
      })
    })

    describe('constructor', () => {
      it('throws error for invalid prom-client', () => {
        expect(() => new PromClientMetricsBackend(null as any)).toThrow(
          'Invalid prom-client instance',
        )
      })

      it('initializes with valid prom-client and calls collectDefaultMetrics', () => {
        expect(() => new PromClientMetricsBackend(mockPromClient)).not.toThrow()
        expect(mockPromClient.collectDefaultMetrics).toHaveBeenCalledWith({
          register: expect.any(Object),
          prefix: 'nodejs_',
          labels: { application: 'fiap-tech-challenge' },
        })
      })
    })
  })

  describe('MetricsService API', () => {
    describe('constructor', () => {
      it('creates service with in-memory backend', () => {
        const metricsService = new MetricsService(new InMemoryMetricsBackend())
        expect(metricsService).toBeDefined()
      })

      it('creates disabled service when configured', () => {
        const metricsService = new MetricsService(new InMemoryMetricsBackend(), { enabled: false })
        expect(metricsService).toBeDefined()
      })
    })

    describe('increment', () => {
      it('increments metric when enabled', async () => {
        service.increment('test_counter', 5)
        await expect(inMemoryBackend.getMetrics()).resolves.toContain('"test_counter": 5')
      })

      it('handles increment errors gracefully', () => {
        const mockBackend = {
          increment: jest.fn().mockImplementation(() => {
            throw new Error('Increment failed')
          }),
          observe: jest.fn(),
          getMetrics: jest.fn(),
        }
        const errorService = new MetricsService(mockBackend as any)
        expect(() => errorService.increment('test_counter', 5)).not.toThrow()
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to increment metric', {
          name: 'test_counter',
          value: 5,
          error: 'Increment failed',
        })
      })

      it('handles increment with labels', async () => {
        service.increment('test_counter', 3, { method: 'GET', status: '200' })
        await expect(inMemoryBackend.getMetrics()).resolves.toContain('"test_counter": 3')
      })
    })

    describe('observe', () => {
      it('observes metric when enabled', async () => {
        service.observe('test_histogram', 1.5)
        await expect(inMemoryBackend.getMetrics()).resolves.toContain('"test_histogram"')
      })

      it('handles observe errors gracefully', () => {
        const mockBackend = {
          increment: jest.fn(),
          observe: jest.fn().mockImplementation(() => {
            throw new Error('Observe failed')
          }),
          getMetrics: jest.fn(),
        }
        const errorService = new MetricsService(mockBackend as any)
        expect(() => errorService.observe('test_histogram', 1.5)).not.toThrow()
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to observe metric', {
          name: 'test_histogram',
          value: 1.5,
          error: 'Observe failed',
        })
      })

      it('handles observe with labels', async () => {
        service.observe('test_histogram', 2.5, { method: 'POST', endpoint: '/api/test' })
        await expect(inMemoryBackend.getMetrics()).resolves.toContain('"test_histogram"')
      })
    })

    describe('gauge', () => {
      it('sets gauge when enabled', async () => {
        service.gauge('test_gauge', 10.5)
        await expect(inMemoryBackend.getMetrics()).resolves.toContain('"test_gauge": 10.5')
      })

      it('handles gauge errors gracefully', () => {
        const mockBackend = {
          increment: jest.fn(),
          observe: jest.fn(),
          getMetrics: jest.fn(),
        }
        const errorService = new MetricsService(mockBackend as any)
        expect(() => errorService.gauge('test_gauge', 10.5)).not.toThrow()
      })

      it('handles gauge with labels', async () => {
        service.gauge('test_gauge', 15.5, { instance: 'server-1' })
        await expect(inMemoryBackend.getMetrics()).resolves.toContain('"test_gauge": 15.5')
      })
    })

    describe('getMetrics', () => {
      it('returns metrics when enabled and logs debug', async () => {
        const metrics = await service.getMetrics()
        expect(() => JSON.parse(metrics)).not.toThrow()
        const parsed = JSON.parse(metrics)
        expect(parsed).toHaveProperty('counters')
        expect(parsed).toHaveProperty('histograms')
        expect(parsed).toHaveProperty('gauges')
        expect(parsed).toHaveProperty('timestamp')
        expect(sharedMockLogger.debug).toHaveBeenCalledWith('Retrieved metrics successfully')
      })

      it('handles getMetrics errors gracefully', async () => {
        const mockBackend = {
          increment: jest.fn(),
          observe: jest.fn(),
          getMetrics: jest.fn().mockRejectedValue(new Error('Get metrics failed')),
        }
        const errorService = new MetricsService(mockBackend as any)
        const metrics = await errorService.getMetrics()
        expect(metrics).toBe('# Error collecting metrics\n')
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to get metrics', {
          error: 'Get metrics failed',
        })
      })
    })

    describe('trackHttpRequest', () => {
      it('tracks HTTP request metrics', async () => {
        service.trackHttpRequest('GET', '/api/users', 200, 150)
        await expect(inMemoryBackend.getMetrics()).resolves.toContain('"http_requests_total"')
        await expect(inMemoryBackend.getMetrics()).resolves.toContain(
          '"http_request_duration_seconds"',
        )
      })

      it('tracks HTTP request with error handling', () => {
        const mockBackend = {
          increment: jest.fn().mockImplementation(() => {
            throw new Error('Increment failed')
          }),
          observe: jest.fn(),
          getMetrics: jest.fn(),
        }
        const errorService = new MetricsService(mockBackend as any)
        expect(() => errorService.trackHttpRequest('POST', '/api/users', 201, 200)).not.toThrow()
      })
    })

    describe('trackDatabaseOperation', () => {
      it('tracks successful database operation', async () => {
        service.trackDatabaseOperation('findMany', 'Users', 50, true)
        await expect(inMemoryBackend.getMetrics()).resolves.toContain('"database_operations_total"')
        await expect(inMemoryBackend.getMetrics()).resolves.toContain(
          '"database_operation_duration_seconds"',
        )
      })

      it('tracks failed database operation', async () => {
        service.trackDatabaseOperation('create', 'Users', 100, false)
        await expect(inMemoryBackend.getMetrics()).resolves.toContain('"database_operations_total"')
        await expect(inMemoryBackend.getMetrics()).resolves.toContain(
          '"database_operation_duration_seconds"',
        )
      })

      it('tracks database operation with error handling', () => {
        const mockBackend = {
          increment: jest.fn().mockImplementation(() => {
            throw new Error('Increment failed')
          }),
          observe: jest.fn(),
          getMetrics: jest.fn(),
        }
        const errorService = new MetricsService(mockBackend as any)
        expect(() => errorService.trackDatabaseOperation('update', 'Users', 75, true)).not.toThrow()
      })
    })

    describe('trackBusinessMetric', () => {
      it('tracks business metric', async () => {
        service.trackBusinessMetric('user_registrations', 1, { source: 'web' })
        await expect(inMemoryBackend.getMetrics()).resolves.toContain(
          '"business_user_registrations_total"',
        )
      })

      it('tracks business metric with error handling', () => {
        const mockBackend = {
          increment: jest.fn().mockImplementation(() => {
            throw new Error('Increment failed')
          }),
          observe: jest.fn(),
          getMetrics: jest.fn(),
        }
        const errorService = new MetricsService(mockBackend as any)
        expect(() =>
          errorService.trackBusinessMetric('orders_placed', 5, { channel: 'mobile' }),
        ).not.toThrow()
      })
    })

    describe('getMetricsSummary', () => {
      it('returns metrics summary when enabled', async () => {
        service.increment('test_counter', 5)
        service.observe('test_histogram', 1.5)
        service.gauge('test_gauge', 10.5)

        const summary = await service.getMetricsSummary()
        expect(summary).toHaveProperty('enabled', true)
        expect(summary).toHaveProperty('backend', 'InMemoryMetricsBackend')
        expect(summary).toHaveProperty('metricsLength')
        expect(summary).toHaveProperty('timestamp')
        expect(typeof (summary as any).metricsLength).toBe('number')
      })

      it('handles getMetricsSummary errors gracefully', async () => {
        const mockBackend = {
          increment: jest.fn(),
          observe: jest.fn(),
          getMetrics: jest.fn().mockRejectedValue(new Error('Summary failed')),
        }
        const errorService = new MetricsService(mockBackend as any)
        const summary = await errorService.getMetricsSummary()

        expect(summary).toHaveProperty('enabled', true)
        expect(summary).toHaveProperty('error', 'Summary failed')
        expect(summary).toHaveProperty('timestamp')
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to get metrics summary', {
          error: 'Summary failed',
        })
      })
    })
  })

  describe('MetricsService edge cases and error branches', () => {
    it('does not operate when disabled', async () => {
      const disabledService = new MetricsService(new InMemoryMetricsBackend(), { enabled: false })
      expect(disabledService.increment('test')).toBeUndefined()
      expect(disabledService.observe('test', 1)).toBeUndefined()
      expect(disabledService.gauge('test', 1)).toBeUndefined()
      await expect(disabledService.getMetrics()).resolves.toBe('# Metrics disabled\n')
      await expect(disabledService.getMetricsSummary()).resolves.toEqual({ enabled: false })
    })

    it('logs stringified errors for non-Error in increment/observe/gauge', async () => {
      const mockBackend1 = {
        increment: jest.fn(() => {
          throw 'fail-string'
        }),
        observe: jest.fn(),
        getMetrics: jest.fn(),
      }
      const svc1 = new MetricsService(mockBackend1 as any)
      svc1.increment('test_counter', 5)
      expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to increment metric', {
        name: 'test_counter',
        value: 5,
        error: 'fail-string',
      })

      const mockBackend2 = {
        increment: jest.fn(),
        observe: jest.fn(() => {
          throw 123
        }),
        getMetrics: jest.fn(),
      }
      const svc2 = new MetricsService(mockBackend2 as any)
      svc2.observe('test_histogram', 1.5)
      expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to observe metric', {
        name: 'test_histogram',
        value: 1.5,
        error: '123',
      })

      const backend3 = new InMemoryMetricsBackend()
      ;(backend3 as any).gauge = jest.fn(() => {
        throw { custom: 'error-object' }
      })
      const svc3 = new MetricsService(backend3)
      svc3.gauge('test_gauge', 10.5)
      expect(sharedMockLogger.error).toHaveBeenCalledWith(
        'Failed to set gauge metric',
        expect.objectContaining({
          name: 'test_gauge',
          value: 10.5,
          error: expect.stringContaining('[object Object]'),
        }),
      )
    })

    it('handles non-Error thrown in getMetrics and getMetricsSummary', async () => {
      const mockBackend = {
        increment: jest.fn(),
        observe: jest.fn(),
        getMetrics: jest.fn().mockRejectedValue('fail-string'),
      }
      const errorService = new MetricsService(mockBackend as any)
      await expect(errorService.getMetrics()).resolves.toBe('# Error collecting metrics\n')
      expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to get metrics', {
        error: 'fail-string',
      })
      const summary = await errorService.getMetricsSummary()
      expect(summary).toHaveProperty('enabled', true)
      expect(summary).toHaveProperty('error', 'fail-string')
      expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to get metrics summary', {
        error: 'fail-string',
      })
    })

    describe('PromClientMetricsBackend string error fallback', () => {
      it('handles non-Error thrown in PromClientMetricsBackend increment', () => {
        const mockProm = {
          Registry: jest.fn().mockImplementation(() => ({
            registerMetric: jest.fn(),
            metrics: jest.fn().mockResolvedValue('mock metrics'),
          })),
          Counter: jest.fn().mockImplementation(() => {
            throw 'prom-counter-error'
          }),
          Histogram: jest.fn().mockImplementation(() => ({ observe: jest.fn() })),
          collectDefaultMetrics: jest.fn(),
        }
        const backend = new PromClientMetricsBackend(mockProm as any)
        backend.increment('test_counter')
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to increment metric', {
          name: 'test_counter',
          value: 1,
          error: 'prom-counter-error',
        })
      })

      it('handles non-Error thrown in PromClientMetricsBackend observe', () => {
        const mockProm = {
          Registry: jest.fn().mockImplementation(() => ({
            registerMetric: jest.fn(),
            metrics: jest.fn().mockResolvedValue('mock metrics'),
          })),
          Counter: jest.fn().mockImplementation(() => ({ inc: jest.fn() })),
          Histogram: jest.fn().mockImplementation(() => {
            throw { prom: 'histogram-error' }
          }),
          collectDefaultMetrics: jest.fn(),
        }
        const backend = new PromClientMetricsBackend(mockProm as any)
        backend.observe('test_histogram', 1.5)
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to observe metric', {
          name: 'test_histogram',
          value: 1.5,
          error: '[object Object]',
        })
      })

      it('handles non-Error thrown in PromClientMetricsBackend getMetrics', async () => {
        const mockProm = {
          Registry: jest.fn().mockImplementation(() => ({
            registerMetric: jest.fn(),
            metrics: jest.fn().mockRejectedValue('prom-metrics-error'),
          })),
          Counter: jest.fn().mockImplementation(() => ({ inc: jest.fn() })),
          Histogram: jest.fn().mockImplementation(() => ({ observe: jest.fn() })),
          collectDefaultMetrics: jest.fn(),
        }
        const backend = new PromClientMetricsBackend(mockProm as any)
        const metrics = await backend.getMetrics()
        expect(metrics).toBe('# Error collecting metrics\n')
        expect(sharedMockLogger.error).toHaveBeenCalledWith('Failed to get metrics', {
          error: 'prom-metrics-error',
        })
      })
    })
  })
})

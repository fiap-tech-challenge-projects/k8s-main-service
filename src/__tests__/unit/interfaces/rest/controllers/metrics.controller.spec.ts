import { Logger } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { MetricsController } from '@interfaces/rest/controllers'
import { InMemoryMetricsBackend, MetricsService } from '@shared/services/metrics.service'

describe('MetricsController', () => {
  let controller: MetricsController
  let metricsService: MetricsService

  beforeEach(async () => {
    const backend = new InMemoryMetricsBackend()
    metricsService = new MetricsService(backend, { enabled: true })

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: metricsService,
        },
      ],
    }).compile()

    controller = module.get<MetricsController>(MetricsController)
    jest.spyOn(Logger.prototype, 'error').mockImplementation()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getMetrics', () => {
    it('should return raw metrics string', async () => {
      const result = await controller.getMetrics()
      expect(typeof result).toBe('string')
      expect(result).toContain('counters')
    })
  })

  describe('getMetricsSummary', () => {
    it('should return metrics summary object', async () => {
      const result = await controller.getMetricsSummary()
      expect(result).toHaveProperty('enabled', true)
      expect(result).toHaveProperty('backend')
    })
  })

  describe('getMeanExecutionTimes', () => {
    it('should return mean execution times object', async () => {
      metricsService.observe('http_request_duration_seconds', 1)
      metricsService.observe('http_request_duration_seconds', 3)

      const result = await controller.getMeanExecutionTimes()
      expect(typeof result).toBe('object')
    })
  })

  describe('getStatus', () => {
    it('should return service status', () => {
      const result = controller.getStatus()
      expect(result).toHaveProperty('enabled', true)
      expect(result).toHaveProperty('timestamp')
    })
  })

  describe('resetMetrics', () => {
    it('should reset metrics and return confirmation', () => {
      const result = controller.resetMetrics()
      expect(result).toEqual({ message: 'Metrics reset successfully' })
    })
  })
})

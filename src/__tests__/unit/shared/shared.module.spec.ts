import { ConfigService } from '@nestjs/config'

import { MetricsService, InMemoryMetricsBackend, PromClientMetricsBackend } from '@shared/services'
import { createMetricsServiceFactory } from '@shared/shared.module'

describe('createMetricsServiceFactory', () => {
  it('returns PromClient backend when configured', () => {
    const mockConfig: any = {
      get: jest
        .fn()
        .mockImplementation((k: string) => (k === 'metrics.backend' ? 'prom-client' : undefined)),
    }

    const svc = createMetricsServiceFactory(mockConfig as ConfigService)

    expect(svc).toBeInstanceOf(MetricsService)
    expect(svc['backend']).toBeInstanceOf(PromClientMetricsBackend)
  })

  it('defaults to InMemory backend', () => {
    const mockConfig: any = { get: jest.fn().mockReturnValue(undefined) }

    const svc = createMetricsServiceFactory(mockConfig as ConfigService)

    expect(svc).toBeInstanceOf(MetricsService)
    expect(svc['backend']).toBeInstanceOf(InMemoryMetricsBackend)
  })
})

import { PromClientMetricsBackend } from '@shared/services/prometheus-backend.service'

describe('PromClientMetricsBackend', () => {
  function createPromClient() {
    const metrics = jest.fn().mockResolvedValue('# mock metrics')
    const registerMetric = jest.fn()
    class Registry {
      metrics = metrics
      registerMetric = registerMetric
    }
    class Counter {
      constructor() {}
      inc = jest.fn()
    }
    class Histogram {
      constructor() {}
      observe = jest.fn()
    }
    const collectDefaultMetrics = jest.fn()
    return { Registry, Counter, Histogram, collectDefaultMetrics }
  }

  it('initializes and records metrics', async () => {
    const prom = createPromClient()
    const backend = new PromClientMetricsBackend(prom as unknown as any)
    backend.increment('test_counter')
    backend.observe('test_histogram', 1.23)
    const out = await backend.getMetrics()
    expect(typeof out).toBe('string')
  })
  it('throws for invalid prom-client', () => {
    expect(() => new PromClientMetricsBackend({} as any)).toThrow('Invalid prom-client instance')
  })
})

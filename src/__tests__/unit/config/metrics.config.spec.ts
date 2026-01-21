import metricsConfigFactory, { MetricsBackendType } from '@config/metrics.config'

describe('metrics.config', () => {
  const OLD = process.env

  beforeEach(() => {
    process.env = { ...OLD }
    // clear all metrics-related env vars to ensure deterministic defaults
    delete process.env.METRICS_DEFAULT_LABELS
    delete process.env.METRICS_BACKEND
    delete process.env.METRICS_ENABLED
    delete process.env.METRICS_LOG_LEVEL
    delete process.env.METRICS_COLLECT_HISTOGRAMS
    delete process.env.METRICS_COLLECT_MEAN_TIMES
  })

  afterAll(() => {
    process.env = OLD
  })

  test('defaults when env is missing', () => {
    const cfg = metricsConfigFactory()
    expect(cfg.backend).toBe(MetricsBackendType.InMemory)
    expect(cfg.enabled).toBeTruthy()
    expect(cfg.logLevel).toBe('info')
  })

  test('parses METRICS_DEFAULT_LABELS and options', () => {
    process.env.METRICS_DEFAULT_LABELS = JSON.stringify({ environment: 'test' })
    process.env.METRICS_BACKEND = 'prom-client'
    process.env.METRICS_ENABLED = 'false'
    const cfg = metricsConfigFactory()
    expect(cfg.defaultLabels.environment).toBe('test')
    expect(cfg.backend).toBe('prom-client')
    expect(cfg.enabled).toBeFalsy()
  })

  test('handles invalid JSON in METRICS_DEFAULT_LABELS gracefully', () => {
    process.env.METRICS_DEFAULT_LABELS = '{invalid-json'
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const cfg = metricsConfigFactory()
    expect(cfg.defaultLabels).toEqual({})
    spy.mockRestore()
  })
})

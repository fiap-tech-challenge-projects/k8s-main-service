import { Logger } from '@nestjs/common'

import { MetricsBackend } from './metrics.service'

/**
 * Prometheus client backend implementation.
 */
export class PromClientMetricsBackend implements MetricsBackend {
  private registry: unknown
  private promClient: unknown
  private counters: Map<string, unknown> = new Map()
  private histograms: Map<string, unknown> = new Map()
  private readonly logger = new Logger(PromClientMetricsBackend.name)

  /**
   * Initialize the Prometheus backend.
   *
   * @param promClient - The prom-client library instance
   */
  constructor(promClient: unknown) {
    this.promClient = promClient
    if (
      promClient &&
      typeof promClient === 'object' &&
      'Registry' in promClient &&
      typeof (promClient as { Registry: new () => unknown }).Registry === 'function'
    ) {
      this.registry = new (promClient as { Registry: new () => unknown }).Registry()
    } else {
      throw new Error('Invalid prom-client instance')
    }
    if (
      promClient &&
      typeof promClient === 'object' &&
      'collectDefaultMetrics' in promClient &&
      typeof (promClient as { collectDefaultMetrics: (...args: unknown[]) => void })
        .collectDefaultMetrics === 'function'
    ) {
      ;(
        promClient as { collectDefaultMetrics: (...args: unknown[]) => void }
      ).collectDefaultMetrics({
        register: this.registry,
        prefix: 'nodejs_',
        labels: { application: 'fiap-tech-challenge' },
      })
    }
  }

  /**
   * Type guard for Counter objects.
   *
   * @param obj - The object to check
   * @returns True if the object is a valid Counter with inc method
   */
  private isCounter(obj: unknown): obj is { inc: (value?: number) => void } {
    return !!obj && typeof obj === 'object' && typeof (obj as { inc: unknown }).inc === 'function'
  }

  /**
   * Type guard for Histogram objects.
   *
   * @param obj - The object to check
   * @returns True if the object is a valid Histogram with observe method
   */
  private isHistogram(obj: unknown): obj is { observe: (value: number) => void } {
    return (
      !!obj &&
      typeof obj === 'object' &&
      typeof (obj as { observe: unknown }).observe === 'function'
    )
  }

  /**
   * Safely register a metric with the registry.
   *
   * @param metric - The metric to register
   */
  private safeRegisterMetric(metric: unknown): void {
    if (
      this.registry &&
      typeof this.registry === 'object' &&
      'registerMetric' in this.registry &&
      typeof (this.registry as { registerMetric: (m: unknown) => void }).registerMetric ===
        'function'
    ) {
      ;(this.registry as { registerMetric: (m: unknown) => void }).registerMetric(metric)
    }
  }

  /**
   * Increment a counter metric.
   *
   * @param name - The name of the counter metric
   * @param value - The value to increment by (default: 1)
   */
  increment(name: string, value = 1): void {
    try {
      if (!this.counters.has(name)) {
        const promClient = this.promClient as Record<string, unknown>
        if (promClient && typeof promClient.Counter === 'function' && this.registry) {
          const counter = new (promClient.Counter as new (opts: unknown) => unknown)({
            name: `${name}_total`,
            help: `Total count of ${name}`,
            labelNames: ['method', 'status', 'endpoint'],
          })
          this.safeRegisterMetric(counter)
          this.counters.set(name, counter)
        }
      }
      const counter = this.counters.get(name)
      if (this.isCounter(counter)) {
        counter.inc(value)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to increment metric', { name, value, error: errorMessage })
    }
  }

  /**
   * Observe a value for histogram metrics.
   *
   * @param name - The name of the histogram metric
   * @param value - The value to observe
   */
  observe(name: string, value: number): void {
    try {
      if (!this.histograms.has(name)) {
        const promClient = this.promClient as Record<string, unknown>
        if (promClient && typeof promClient.Histogram === 'function' && this.registry) {
          const histogram = new (promClient.Histogram as new (opts: unknown) => unknown)({
            name: `${name}_seconds`,
            help: `Duration of ${name} in seconds`,
            labelNames: ['method', 'endpoint'],
            buckets: [0.1, 0.5, 1, 2, 5, 10],
          })
          this.safeRegisterMetric(histogram)
          this.histograms.set(name, histogram)
        }
      }
      const histogram = this.histograms.get(name)
      if (this.isHistogram(histogram)) {
        histogram.observe(value)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to observe metric', { name, value, error: errorMessage })
    }
  }

  /**
   * Get formatted metrics in Prometheus format.
   *
   * @returns Promise resolving to Prometheus-formatted metrics string
   */
  async getMetrics(): Promise<string> {
    try {
      if (
        this.registry &&
        typeof this.registry === 'object' &&
        'metrics' in this.registry &&
        typeof (this.registry as { metrics: () => Promise<string> }).metrics === 'function'
      ) {
        return await (this.registry as { metrics: () => Promise<string> }).metrics()
      }
      return '# No metrics registry available\n'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to get metrics', { error: errorMessage })
      return '# Error collecting metrics\n'
    }
  }
}

import { Injectable, Logger } from '@nestjs/common'

/**
 * Interface for metrics backend implementations.
 */
export interface MetricsBackend {
  increment(name: string, value?: number): void
  observe(name: string, value: number): void
  getMetrics(): Promise<string>
}

/**
 * In-memory backend implementation for development and testing.
 */
export class InMemoryMetricsBackend implements MetricsBackend {
  private counters: Record<string, number> = {}
  private histograms: Record<string, number[]> = {}
  private gauges: Record<string, number> = {}
  private meanTimes: Record<string, { total: number; count: number; average: number }> = {}

  /**
   * Increment a counter metric.
   *
   * @param name - The name of the counter metric
   * @param value - The value to increment by (default: 1)
   */
  increment(name: string, value = 1) {
    this.counters[name] = (this.counters[name] ?? 0) + value
  }

  /**
   * Observe a value for histogram metrics.
   *
   * @param name - The name of the histogram metric
   * @param value - The value to observe
   */
  observe(name: string, value: number) {
    if (!this.histograms[name]) {
      this.histograms[name] = []
    }
    this.histograms[name].push(value)

    // Track mean time for duration metrics
    if (name.includes('duration') || name.includes('seconds')) {
      this.updateMeanTime(name, value)
    }
  }

  /**
   * Update mean time calculation for duration metrics.
   *
   * @param name - The metric name
   * @param value - The duration value
   */
  private updateMeanTime(name: string, value: number) {
    if (!this.meanTimes[name]) {
      this.meanTimes[name] = { total: 0, count: 0, average: 0 }
    }

    const metric = this.meanTimes[name]
    metric.total += value
    metric.count += 1
    metric.average = metric.total / metric.count
  }

  /**
   * Set a gauge metric value.
   *
   * @param name - The name of the gauge metric
   * @param value - The value to set
   */
  gauge(name: string, value: number) {
    this.gauges[name] = value
  }

  /**
   * Get formatted metrics as JSON string.
   *
   * @returns Promise resolving to JSON-formatted metrics string
   */
  async getMetrics(): Promise<string> {
    const metrics = {
      counters: this.counters,
      histograms: this.histograms,
      gauges: this.gauges,
      meanTimes: this.meanTimes,
      timestamp: new Date().toISOString(),
    }
    return JSON.stringify(metrics, null, 2)
  }

  /**
   * Reset all metrics data.
   */
  reset(): void {
    this.counters = {}
    this.histograms = {}
    this.gauges = {}
    this.meanTimes = {}
  }
}

/**
 * Configuration interface for metrics service.
 */
export interface MetricsConfig {
  enabled: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  collectHistograms: boolean
  collectMeanTimes: boolean
  defaultLabels: Record<string, string>
}

/**
 * Service for managing application metrics and monitoring.
 */
@Injectable()
export class MetricsService {
  private readonly backend: MetricsBackend
  private readonly config: MetricsConfig
  private readonly logger = new Logger(MetricsService.name)

  /**
   * Initialize the metrics service with the provided backend and configuration.
   *
   * @param backend - The metrics backend to use
   * @param config - Optional configuration overrides
   */
  constructor(backend: MetricsBackend, config?: Partial<MetricsConfig>) {
    this.backend = backend
    this.config = {
      enabled: true,
      logLevel: 'info',
      collectHistograms: true,
      collectMeanTimes: true,
      defaultLabels: {},
      ...config,
    }
    this.logger.log(`MetricsService initialized with ${backend.constructor.name} backend`)
  }

  /**
   * Check if metrics collection is enabled.
   *
   * @returns True if metrics are enabled
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * Increment a counter metric.
   *
   * @param name - The name of the counter metric
   * @param value - The value to increment by (default: 1)
   * @param labels - Optional labels for the metric
   */
  increment(name: string, value = 1, labels?: Record<string, string>): void {
    if (!this.isEnabled()) return
    try {
      this.backend.increment(name, value)
      this.logger.debug('Incremented metric', { name, value, labels })
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
   * @param labels - Optional labels for the metric
   */
  observe(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.isEnabled() || !this.config.collectHistograms) return
    try {
      this.backend.observe(name, value)
      this.logger.debug('Observed metric', { name, value, labels })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to observe metric', { name, value, error: errorMessage })
    }
  }

  /**
   * Set a gauge metric value.
   *
   * @param name - The name of the gauge metric
   * @param value - The value to set
   * @param labels - Optional labels for the metric
   */
  gauge(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.isEnabled()) return
    try {
      if (this.backend instanceof InMemoryMetricsBackend) {
        this.backend.gauge(name, value)
      }
      this.logger.debug('Set gauge metric', { name, value, labels })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to set gauge metric', { name, value, error: errorMessage })
    }
  }

  /**
   * Get formatted metrics for export.
   *
   * @returns Promise resolving to formatted metrics string
   */
  async getMetrics(): Promise<string> {
    if (!this.isEnabled()) {
      return '# Metrics disabled\n'
    }
    try {
      const metrics = await this.backend.getMetrics()
      this.logger.debug('Retrieved metrics successfully')
      return metrics
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to get metrics', { error: errorMessage })
      return '# Error collecting metrics\n'
    }
  }

  /**
   * Track HTTP request metrics.
   *
   * @param method - HTTP method
   * @param endpoint - Request endpoint
   * @param statusCode - Response status code
   * @param duration - Request duration in seconds
   */
  trackHttpRequest(method: string, endpoint: string, statusCode: number, duration: number): void {
    this.increment('http_requests_total', 1, { method, endpoint, status: statusCode.toString() })
    this.observe('http_request_duration_seconds', duration, { method, endpoint })

    // Track mean time specifically if enabled
    if (this.config.collectMeanTimes) {
      this.observe('http_request_mean_time_seconds', duration, { method, endpoint })
    }

    const statusCategory = Math.floor(statusCode / 100) * 100
    this.increment('http_requests_by_status', 1, { status: statusCategory.toString() })
  }

  /**
   * Track database operation metrics.
   *
   * @param operation - Database operation type
   * @param table - Database table name
   * @param duration - Operation duration in seconds
   * @param success - Whether the operation was successful
   */
  trackDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
  ): void {
    this.increment('database_operations_total', 1, {
      operation,
      table,
      success: success.toString(),
    })
    this.observe('database_operation_duration_seconds', duration, { operation, table })

    // Track mean time specifically if enabled
    if (this.config.collectMeanTimes) {
      this.observe('database_operation_mean_time_seconds', duration, { operation, table })
    }

    if (!success) {
      this.increment('database_errors_total', 1, { operation, table })
    }
  }

  /**
   * Track business metrics.
   *
   * @param metric - Metric name
   * @param value - Metric value
   * @param labels - Optional labels
   */
  trackBusinessMetric(metric: string, value: number, labels?: Record<string, string>): void {
    this.increment(`business_${metric}_total`, value, labels)
  }

  /**
   * Get metrics summary for health checks.
   *
   * @returns Promise resolving to metrics summary object
   */
  async getMetricsSummary(): Promise<Record<string, unknown>> {
    if (!this.isEnabled()) {
      return { enabled: false }
    }
    try {
      const metrics = await this.backend.getMetrics()
      return {
        enabled: true,
        backend: this.backend.constructor.name,
        config: this.config,
        metricsLength: metrics.length,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to get metrics summary', { error: errorMessage })
      return {
        enabled: true,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Get mean execution times for all tracked operations.
   *
   * @returns Promise resolving to mean execution times object
   */
  async getMeanExecutionTimes(): Promise<Record<string, number>> {
    if (!this.isEnabled() || !this.config.collectMeanTimes) {
      return {}
    }
    try {
      const metrics = await this.backend.getMetrics()
      const parsed = JSON.parse(metrics) as Record<string, unknown>

      if (parsed.meanTimes && typeof parsed.meanTimes === 'object') {
        const meanTimes: Record<string, number> = {}
        for (const [key, value] of Object.entries(parsed.meanTimes)) {
          if (typeof value === 'object' && value !== null && 'average' in value) {
            meanTimes[key] = (value as { average: number }).average
          }
        }
        return meanTimes
      }
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to get mean execution times', { error: errorMessage })
      return {}
    }
  }

  /**
   * Reset all metrics data.
   */
  reset(): void {
    if (this.backend instanceof InMemoryMetricsBackend) {
      this.backend.reset()
      this.logger.log('Metrics reset successfully')
    } else {
      this.logger.warn('Reset not supported for current backend')
    }
  }
}

import { registerAs } from '@nestjs/config'
import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator'

export enum MetricsBackendType {
  InMemory = 'in-memory',
  PromClient = 'prom-client',
}

/**
 * Metrics configuration schema for validation.
 */
export class MetricsConfigSchema {
  @IsEnum(MetricsBackendType)
  @IsOptional()
  METRICS_BACKEND?: MetricsBackendType

  @IsBoolean()
  @IsOptional()
  METRICS_ENABLED?: boolean

  @IsString()
  @IsOptional()
  METRICS_LOG_LEVEL?: string

  @IsBoolean()
  @IsOptional()
  METRICS_COLLECT_HISTOGRAMS?: boolean

  @IsBoolean()
  @IsOptional()
  METRICS_COLLECT_MEAN_TIMES?: boolean

  @IsString()
  @IsOptional()
  METRICS_DEFAULT_LABELS?: string
}

/**
 * Metrics configuration factory.
 *
 * Provides configuration for the metrics service with environment variable support.
 *
 * @example
 * // In .env file
 * METRICS_BACKEND=prom-client
 * METRICS_ENABLED=true
 * METRICS_LOG_LEVEL=debug
 * METRICS_COLLECT_HISTOGRAMS=true
 * METRICS_COLLECT_MEAN_TIMES=true
 * METRICS_DEFAULT_LABELS={"environment":"production","service":"api"}
 *
 * // Defaults to in-memory if not specified
 */
export default registerAs('metrics', () => {
  let defaultLabels: Record<string, string> = {}

  if (process.env.METRICS_DEFAULT_LABELS) {
    try {
      const parsed = JSON.parse(process.env.METRICS_DEFAULT_LABELS) as Record<string, string>
      defaultLabels = parsed
    } catch {
      console.error('Invalid METRICS_DEFAULT_LABELS JSON, using empty object')
    }
  }

  return {
    backend: (process.env.METRICS_BACKEND as MetricsBackendType) ?? MetricsBackendType.InMemory,
    enabled: process.env.METRICS_ENABLED !== 'false', // Default to true
    logLevel: (process.env.METRICS_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ?? 'info',
    collectHistograms: process.env.METRICS_COLLECT_HISTOGRAMS !== 'false', // Default to true
    collectMeanTimes: process.env.METRICS_COLLECT_MEAN_TIMES !== 'false', // Default to true
    defaultLabels: defaultLabels,
  }
})

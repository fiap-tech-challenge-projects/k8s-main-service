import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as promClient from 'prom-client'

import { MetricsBackendType } from '@config/metrics.config'
import { UserContextService } from '@shared/services/user-context.service'

import { InMemoryEventBus, EVENT_BUS } from './events'
import {
  RetryService,
  MetricsService,
  InMemoryMetricsBackend,
  PromClientMetricsBackend,
  MetricsConfig,
  BusinessExceptionHandlerService,
  PrismaErrorHandlerService,
  ExceptionHandlerRegistryService,
} from './services'

/**
 * Factory function for MetricsService to allow backend selection via DI.
 *
 * @param configService - The ConfigService instance
 * @returns MetricsService instance with the correct backend and configuration
 */
export function createMetricsServiceFactory(configService: ConfigService): MetricsService {
  const backendType = configService.get<MetricsBackendType>('metrics.backend')
  const enabled = configService.get<boolean>('metrics.enabled', true)
  const logLevel = configService.get<string>('metrics.logLevel', 'info')
  const collectHistograms = configService.get<boolean>('metrics.collectHistograms', true)
  const collectMeanTimes = configService.get<boolean>('metrics.collectMeanTimes', true)
  const defaultLabels = configService.get<Record<string, string>>('metrics.defaultLabels', {})

  const config: MetricsConfig = {
    enabled,
    logLevel: logLevel as 'debug' | 'info' | 'warn' | 'error',
    collectHistograms,
    collectMeanTimes,
    defaultLabels,
  }

  if (backendType === 'prom-client') {
    return new MetricsService(new PromClientMetricsBackend(promClient), config)
  }
  // Default to in-memory backend
  return new MetricsService(new InMemoryMetricsBackend(), config)
}

/**
 * Shared module that provides shared utilities, services, filters, and interceptors
 * used across the application.
 */
@Module({
  providers: [
    RetryService,
    {
      provide: MetricsService,
      useFactory: createMetricsServiceFactory,
      inject: [ConfigService],
    },
    BusinessExceptionHandlerService,
    PrismaErrorHandlerService,
    ExceptionHandlerRegistryService,
    UserContextService,
    {
      provide: EVENT_BUS,
      useClass: InMemoryEventBus,
    },
  ],
  exports: [
    RetryService,
    MetricsService,
    BusinessExceptionHandlerService,
    PrismaErrorHandlerService,
    ExceptionHandlerRegistryService,
    UserContextService,
    EVENT_BUS,
  ],
})
export class SharedModule {}

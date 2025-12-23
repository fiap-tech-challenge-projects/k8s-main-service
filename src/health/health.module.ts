import { Module } from '@nestjs/common'
import { Logger as WinstonLogger } from 'winston'

import { LoggerFactory } from '../config'

import { HealthController } from './health.controller'

/**
 * Health module for Kubernetes probes
 */
@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: 'LOGGER',
      useFactory: (): WinstonLogger => {
        return LoggerFactory.createLogger(
          process.env.SERVICE_NAME ?? 'k8s-main-service',
          process.env.NODE_ENV ?? 'development',
          process.env.LOG_LEVEL ?? 'debug',
        )
      },
    },
  ],
})
export class HealthModule {}

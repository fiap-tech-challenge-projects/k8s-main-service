import { Module } from '@nestjs/common'

import { HealthController } from './health.controller'

/**
 * Health module for Kubernetes probes
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}

import { Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common'
import { Logger as WinstonLogger } from 'winston'

/**
 * Health check controller
 * Provides liveness and readiness probe endpoints for Kubernetes
 */
@Controller('health')
export class HealthController {
  /**
   * Creates an instance of HealthController
   * @param logger - Winston logger instance
   */
  constructor(@Inject('LOGGER') private readonly logger: WinstonLogger) {}

  /**
   * Liveness probe endpoint
   * Indicates if the application process is running
   * Used by Kubernetes to restart unhealthy containers
   * @returns Health status response
   */
  @Get('/live')
  @HttpCode(HttpStatus.OK)
  live(): { status: string } {
    this.logger.debug('Liveness probe called')
    return { status: 'alive' }
  }

  /**
   * Readiness probe endpoint
   * Indicates if the application is ready to accept traffic
   * Used by Kubernetes to route traffic to healthy pods
   * @returns Ready status response
   */
  @Get('/ready')
  @HttpCode(HttpStatus.OK)
  ready(): { status: string } {
    this.logger.debug('Readiness probe called')
    return { status: 'ready' }
  }

  /**
   * Basic health check endpoint
   * General health status with uptime information
   * @returns Health information object
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  health(): object {
    this.logger.debug('Health check called')
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }
}

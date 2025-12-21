import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { Logger as WinstonLogger } from 'winston'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { LoggerFactory } from './config'
import { HealthModule } from './health'
import { HttpLoggingMiddleware } from './middleware'

/**
 * Application root module
 * Configures all application modules, middleware, and providers
 */
@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [
    AppService,
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
export class AppModule implements NestModule {
  /**
   * Configures middleware
   * @param consumer - Middleware consumer
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggingMiddleware).forRoutes('*')
  }
}

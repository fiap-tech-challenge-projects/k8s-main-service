import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { LoggerModule } from 'nestjs-pino'

import { ApplicationModule } from '@application/application.module'
import { LOGGING_CONFIG } from '@config/logging.config'
import { InfraModule } from '@infra/infra.module'
import { InterfacesModule } from '@interfaces/interfaces.module'
import { GlobalExceptionFilter } from '@shared/filters'
import { UserContextMiddleware } from '@shared/middleware'
import { ExceptionHandlerRegistryService } from '@shared/services'
import { SharedModule } from '@shared/shared.module'

/**
 * Main application module
 * Imports all feature modules
 */
@Module({
  imports: [
    LoggerModule.forRoot(LOGGING_CONFIG),
    SharedModule,
    ApplicationModule,
    InfraModule,
    InterfacesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (exceptionRegistry: ExceptionHandlerRegistryService) => {
        return new GlobalExceptionFilter(exceptionRegistry)
      },
      inject: [ExceptionHandlerRegistryService],
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configures middleware for the application
   * @param consumer - Middleware consumer instance
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserContextMiddleware).forRoutes('*')
  }
}

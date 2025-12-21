import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { Logger as WinstonLogger } from 'winston'

import { AppModule } from './app.module'
import { validateConfig, LoggerFactory } from './config'
import { AllExceptionsFilter } from './filters'

async function bootstrap(): Promise<void> {
  // Validate environment variables on startup
  const config = validateConfig()

  // Create logger for bootstrap process
  const logger: WinstonLogger = LoggerFactory.createLogger(
    config.SERVICE_NAME,
    config.NODE_ENV,
    config.LOG_LEVEL,
  )

  // Create NestJS application
  const app = await NestFactory.create(AppModule)

  // Add security middleware with HTTP headers
  app.use(helmet())

  // Register global exception filter for centralized error handling
  app.useGlobalFilters(new AllExceptionsFilter(logger))

  // Setup Swagger API documentation (can be disabled in production)
  if (config.SWAGGER_ENABLED === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('k8s Main Service API')
      .setDescription('Kubernetes main service REST API documentation')
      .setVersion(config.SERVICE_VERSION)
      .addTag('health', 'Health check endpoints')
      .addTag('app', 'Application endpoints')
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup(config.SWAGGER_PATH, app, document)

    logger.info('Swagger documentation enabled at ' + config.SWAGGER_PATH)
  }

  // Start application and listen on configured port
  await app.listen(config.PORT, '0.0.0.0')

  logger.info(`${config.SERVICE_NAME} v${config.SERVICE_VERSION} running on port ${config.PORT}`)
  logger.info(`Environment: ${config.NODE_ENV}`)
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error)
  process.exit(1)
})

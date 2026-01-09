import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { PinoLogger, LoggerErrorInterceptor, Logger } from 'nestjs-pino'

import { LoggingInterceptor, MetricsInterceptor } from '@shared/interceptors'
import { MetricsService } from '@shared/services'

import { AppModule } from './app.module'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _tracing from './tracing'

/**
 * Initialize OpenTelemetry SDK before any other code runs.
 * This must be called as early as possible to ensure all automatic instrumentation works.
 */

/**
 * Sets up CORS configuration.
 *
 * @param app - The NestJS Fastify application instance
 */
async function setupCors(app: NestExpressApplication): Promise<void> {
  app.enableCors({
    origin: true,
    credentials: true,
  })
}

/**
 * Sets up global validation pipe.
 *
 * @param app - The NestJS Fastify application instance
 */
function setupValidation(app: NestExpressApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
}

/**
 * Sets up API versioning.
 *
 * @param app - The NestJS Fastify application instance
 */
function setupVersioning(app: NestExpressApplication): void {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })
}

/**
 * Sets up global interceptors.
 *
 * @param app - The NestJS Express application instance
 */
async function setupInterceptors(app: NestExpressApplication): Promise<void> {
  app.useGlobalInterceptors(new LoggingInterceptor())
  const metricsService = app.get(MetricsService)
  app.useGlobalInterceptors(new MetricsInterceptor(metricsService))
  app.useGlobalInterceptors(new LoggerErrorInterceptor())
}

/**
 * Sets up the application logger.
 *
 * @param app - The NestJS Fastify application instance
 */
function setupLogger(app: NestExpressApplication): void {
  app.useLogger(app.get(Logger))
}

/**
 * Sets up Swagger API documentation.
 *
 * @param app - The NestJS Fastify application instance
 */
function setupSwagger(app: NestExpressApplication): void {
  const config = new DocumentBuilder()
    .setTitle('FIAP Tech Challenge')
    .setDescription('API Documentation')
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Local server')
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your Bearer token',
    })
    .addSecurityRequirements('Bearer')
    .addTag('Authentication', 'User authentication, registration, and token management')
    .addTag('Budget Items', 'Budget item management and pricing operations')
    .addTag('Budgets', 'Budget creation, approval, and management operations')
    .addTag('Client Portal - Budgets', 'Client-facing budget viewing and approval operations')
    .addTag(
      'Client Portal - Service Orders',
      'Client-facing service order tracking and status operations',
    )
    .addTag('Clients', 'Client management, authentication, and profile operations')
    .addTag('Employees', 'Employee management and role operations')
    .addTag('Metrics', 'Metrics and monitoring endpoints')
    .addTag('Service Executions', 'Service execution tracking and monitoring')
    .addTag('Service Orders', 'Service order processing and management')
    .addTag('Services', 'Service catalog management operations')
    .addTag('Stock', 'Stock and inventory management operations')
    .addTag('Vehicle Evaluations', 'Vehicle evaluation and assessment operations')
    .addTag('Vehicles', 'Vehicle management and tracking operations')
    .addTag('Welcome', 'API welcome information and health checks')
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    deepScanRoutes: true,
  })

  const apiDocsPath = process.env.API_DOCS_PATH ?? 'api-docs'
  SwaggerModule.setup(apiDocsPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      security: [{ bearer: [] }],
    },
    customSiteTitle: 'FIAP Tech Challenge API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; font-size: 2.5em; }
      .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
    `,
  })
}

/**
 * Configures the NestJS application with all necessary settings.
 *
 * @param app - The NestJS application instance to configure
 */
async function configureApp(app: NestExpressApplication): Promise<void> {
  await setupCors(app)

  setupValidation(app)
  setupVersioning(app)

  await setupInterceptors(app)
  setupLogger(app)

  // Setup documentation
  setupSwagger(app)
}

/**
 * Gets application configuration from environment variables.
 *
 * @returns Object containing port configuration
 */
function getAppConfig() {
  return {
    port: process.env.PORT ?? '3000',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  }
}

/**
 * Logs application startup information.
 *
 * @param logger - The Pino logger instance
 * @param config - Application configuration object
 * @param config.port - The REST API port
 * @param config.nodeEnv - The Node.js environment
 */
function logStartupInfo(logger: PinoLogger, config: { port: string; nodeEnv: string }): void {
  const protocol = 'http'

  logger.info(`Application is running on: ${protocol}://localhost:${config.port}`)
  logger.info(`API Documentation: ${protocol}://localhost:${config.port}/api-docs`)
  logger.info(`Environment: ${config.nodeEnv}`)
  logger.info(`REST API Port: ${config.port}`)
}

/**
 * Starts the main application.
 *
 * @param app - The NestJS application instance
 * @param config - Application configuration object
 * @param config.port - The REST API port
 * @param config.nodeEnv - The Node.js environment
 */
async function startServices(
  app: NestExpressApplication,
  config: { port: string; nodeEnv: string },
): Promise<void> {
  await app.listen(config.port, '0.0.0.0')
}

/**
 * Bootstrap function to start the application.
 */
async function bootstrap() {
  try {
    // Create the application
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    // Configure the application
    await configureApp(app)

    // Get logger and configuration
    const logger = await app.resolve(PinoLogger)
    const config = getAppConfig()

    // Start services
    await startServices(app, config)

    // Log startup information
    logStartupInfo(logger, config)
  } catch (error) {
    console.error('Failed to start application:', error)
    process.exit(1)
  }
}

bootstrap().catch((error) => {
  console.error('Unhandled error in bootstrap', error)
})

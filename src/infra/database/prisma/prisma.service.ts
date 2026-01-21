import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  INestApplication,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'

import { RetryService } from '@shared/services'

/**
 * Prisma database service for managing database connections and operations.
 *
 * Extends PrismaClient to provide enhanced database functionality including
 * connection lifecycle management, transaction handling, and health checks.
 * Implements NestJS lifecycle hooks for proper initialization and cleanup.
 *
 * Features:
 * - Automatic connection management
 * - Transaction wrapper with error handling
 * - Database health checks
 * - Graceful shutdown handling
 * - Comprehensive logging
 * - Robust connection retry logic using RetryService
 *
 * @note For advanced connection pooling in production, consider using PgBouncer or Prisma Accelerate.
 * @note In the future, CQRS patterns may require separate PrismaService instances for queries and commands, each with its own connection and pooling config.
 *
 * @example
 * // Basic usage in a service
 * constructor(private readonly prisma: PrismaService) {}
 *
 * async findUser(id: string) {
 *   return this.prisma.users.findUnique({ where: { id } });
 * }
 *
 * // Using transactions
 * const result = await this.prisma.transaction(async (tx) => {
 *   const user = await tx.users.create({ data: userData });
 *   await tx.profiles.create({ data: { userId: user.id } });
 *   return user;
 * });
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  /**
   * Creates a new PrismaService instance.
   *
   * Initializes PrismaClient with logging configuration and sets up
   * the logger context for structured logging.
   *
   * @param retryService - Service for robust retry logic
   * @param configService - NestJS config service (optional, for future CQRS split)
   */
  constructor(
    @Inject(forwardRef(() => RetryService)) private readonly retryService: RetryService,
    @Inject(forwardRef(() => ConfigService)) private readonly configService: ConfigService,
  ) {
    const databaseUrl = configService.get<string>('database.databaseUrl')

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === 'test' ? [] : ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    })
  }

  /**
   * Initializes the database connection when the module starts.
   *
   * Attempts to establish a connection to the database with retry logic.
   * Logs the connection status. Throws an error if connection fails after retries.
   *
   * @throws Error if database connection fails after all retry attempts
   *
   * @example
   * // Called automatically by NestJS when module initializes
   * await this.onModuleInit();
   */
  async onModuleInit() {
    this.logger.log('Connecting to database with retry logic...')
    try {
      await this.retryService.withRetry(async () => {
        await this.$connect()
        this.logger.log('Successfully connected to database')
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to connect to database after retries', { error: errorMessage })
      throw error
    }
  }

  /**
   * Cleans up the database connection when the module is destroyed.
   *
   * Gracefully disconnects from the database and logs the disconnection
   * status. Throws an error if disconnection fails.
   *
   * @throws Error if database disconnection fails
   *
   * @example
   * // Called automatically by NestJS when module is destroyed
   * await this.onModuleDestroy();
   */
  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...')

    try {
      await this.$disconnect()
      this.logger.log('Successfully disconnected from database')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to disconnect from database', { error: errorMessage })
      throw error
    }
  }

  /**
   * Enables graceful shutdown hooks for the application.
   *
   * Sets up process event listeners to ensure the database connection
   * is properly closed when the application shuts down.
   *
   * @param app - NestJS application instance for graceful shutdown
   *
   * @example
   * // In main.ts
   * const app = await NestFactory.create(AppModule);
   * const prismaService = app.get(PrismaService);
   * prismaService.enableShutdownHooks(app);
   */
  enableShutdownHooks(app: INestApplication) {
    this.logger.log('Enabling shutdown hooks...')

    process.on('beforeExit', () => {
      this.logger.log('Application shutting down, closing database connection...')
      void app.close()
    })
  }

  /**
   * Executes a database transaction with automatic rollback on error.
   *
   * Wraps the provided function in a database transaction. If the function
   * completes successfully, the transaction is committed. If an error occurs,
   * the transaction is automatically rolled back.
   *
   * @param fn - Function to execute within the transaction context
   * @returns Promise resolving to the transaction result
   * @throws Error if the transaction fails
   *
   * @example
   * const result = await this.transaction(async (tx) => {
   *   const user = await tx.users.create({
   *     data: { userName: 'john_doe', email: 'john@example.com' }
   *   });
   *
   *   await tx.profiles.create({
   *     data: { userId: user.id, firstName: 'John', lastName: 'Doe' }
   *   });
   *
   *   return user;
   * });
   */
  async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    this.logger.debug('Starting database transaction')

    try {
      const result = await this.$transaction(fn)
      this.logger.debug('Database transaction completed successfully')
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Database transaction failed', { error: errorMessage })
      throw error
    }
  }

  /**
   * Performs a health check on the database connection.
   *
   * Executes a simple query to verify the database connection is active
   * and responsive. Useful for monitoring and health check endpoints.
   *
   * @returns Promise resolving to true if health check passes, false otherwise
   *
   * @example
   * const isHealthy = await this.healthCheck();
   * if (!isHealthy) {
   *   // Handle unhealthy database state
   * }
   */
  async healthCheck(): Promise<boolean> {
    this.logger.debug('Performing database health check')

    try {
      await this.$queryRaw`SELECT 1`
      this.logger.debug('Database health check passed')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error('Database health check failed', { error: errorMessage })
      return false
    }
  }
}

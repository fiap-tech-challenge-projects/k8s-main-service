import {
  INestApplication,
  Logger,
  ValidationPipe,
  ForbiddenException,
  MiddlewareConsumer,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { UserRole } from '@prisma/client'

import { PrismaService } from '@infra/database/prisma/prisma.service'
import { ROLES_KEY } from '@shared/decorators'
import { RolesGuard } from '@shared/guards'
import { UserContextService } from '@shared/services/user-context.service'

import { AppModule } from '../../app.module'

import { TestAuthUtils, TestUserContextMiddleware } from './factories'

/**
 * Mock RolesGuard for integration tests that uses the mock UserContextService
 */
@Injectable()
class MockRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userContextService: UserContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const userRole = this.userContextService.getUserRole()

    if (!userRole) {
      throw new ForbiddenException('User role not found in context')
    }

    const hasRole = requiredRoles.some((role) => userRole === role)

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions')
    }

    return true
  }
}

/**
 * Mock UserContextService for integration tests
 */
class MockUserContextService extends UserContextService {
  // Override the scope to be singleton for testing
  constructor() {
    super()
  }
}

/**
 * Test application module that extends the main AppModule with test-specific configurations
 */
class TestAppModule extends AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TestUserContextMiddleware).forRoutes('*')
  }
}

/**
 * Base class for integration tests providing common setup and teardown functionality.
 *
 * This class handles:
 * - Application initialization with real database connection
 * - Database cleanup between tests
 * - Proper resource cleanup after tests
 * - Common test utilities and helpers
 */
export class IntegrationTestBase {
  public app: INestApplication
  public module: TestingModule
  public prismaService: PrismaService
  public configService: ConfigService
  public authUtils: TestAuthUtils
  public mockUserContextService: MockUserContextService

  /**
   * Sets up the test environment before all tests in the suite.
   * Initializes the NestJS application with real database connection.
   */
  async beforeAll(): Promise<void> {
    process.env.NODE_ENV = 'test'
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5433/fiap-tech-challenge-test?schema=public'
    process.env.TEST_DATABASE_URL =
      process.env.TEST_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5433/fiap-tech-challenge-test?schema=public'
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32-chars-minimum'
    process.env.JWT_EXPIRES_IN = '1h'
    process.env.LOG_LEVEL = 'silent'

    // Create mock user context service
    this.mockUserContextService = new MockUserContextService()

    this.module = await Test.createTestingModule({
      imports: [TestAppModule],
    })
      .overrideProvider(UserContextService)
      .useValue(this.mockUserContextService)
      .overrideProvider(RolesGuard)
      .useValue(new MockRolesGuard(new Reflector(), this.mockUserContextService))
      .compile()

    this.app = this.module.createNestApplication()
    this.prismaService = this.module.get<PrismaService>(PrismaService)
    this.configService = this.module.get<ConfigService>(ConfigService)
    this.authUtils = new TestAuthUtils(this.app, this.mockUserContextService)

    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )

    await this.app.init()
  }

  /**
   * Cleans up the test environment after all tests in the suite.
   * Disconnects from database and closes the application.
   */
  async afterAll(): Promise<void> {
    if (this.prismaService) {
      await this.prismaService.$disconnect()
    }
    if (this.app) {
      await this.app.close()
    }
  }

  /**
   * Cleans up the database after each test to ensure test isolation.
   * Deletes all data from all tables in the correct order to respect foreign key constraints.
   */
  async afterEach(): Promise<void> {
    await this.cleanDatabase()
    if (this.authUtils) {
      this.authUtils.clearUserContext()
    }
  }

  /**
   * More comprehensive cleanup that also resets auto-increment IDs
   * Uses deadlock-safe approach with retries and ordered operations
   */
  async cleanDatabaseComprehensive(): Promise<void> {
    const maxRetries = 3
    let retryCount = 0

    while (retryCount < maxRetries) {
      try {
        // Use a single atomic operation to avoid deadlocks
        await this.prismaService.$transaction(
          async (prisma) => {
            // First, get table dependencies in proper order (leaf tables first)
            const orderedTables = [
              'budget_items',
              'service_executions',
              'vehicle_evaluations',
              'stock_movements',
              'stock_orders',
              'budgets',
              'service_orders',
              'vehicles',
              'users',
              'clients',
              'employees',
              'services',
              'stock_items',
            ]

            // Delete data in dependency order to avoid foreign key violations
            for (const tableName of orderedTables) {
              try {
                await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}"`)
              } catch (error) {
                // Ignore errors for tables that don't exist
                if (!error.message.includes('does not exist')) {
                  throw error
                }
              }
            }

            // Reset sequences for tables that have them
            const sequenceTables = [
              'stock_movements',
              'stock_orders',
              'service_executions',
              'vehicle_evaluations',
            ]

            for (const tableName of sequenceTables) {
              try {
                await prisma.$executeRawUnsafe(
                  `ALTER SEQUENCE "${tableName}_id_seq" RESTART WITH 1`,
                )
              } catch (error) {
                // Ignore errors for sequences that don't exist
                if (!error.message.includes('does not exist')) {
                  Logger.warn(`Failed to reset sequence for ${tableName}: ${error.message}`)
                }
              }
            }
          },
          {
            timeout: 10000, // 10 second timeout
            isolationLevel: 'ReadCommitted', // Less restrictive isolation level
          },
        )

        Logger.log('Comprehensive database cleanup completed successfully')
        return // Success, exit retry loop
      } catch (error) {
        retryCount++
        const hasDeadlockError = error.message.includes('deadlock detected')
        const hasDeadlockCode = error.message.includes('40P01')
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const isDeadlock = hasDeadlockError || hasDeadlockCode

        if (isDeadlock && retryCount < maxRetries) {
          Logger.warn(`Deadlock detected during cleanup, retrying (${retryCount}/${maxRetries})...`)
          // Wait with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 100))
          continue
        }

        Logger.warn(
          `Comprehensive cleanup failed after ${retryCount} attempts, falling back to standard cleanup: ${error.message}`,
        )
        await this.cleanDatabase()
        return
      }
    }
  }

  /**
   * Cleans the database by deleting all records from all tables.
   * Tables are deleted in reverse dependency order to respect foreign key constraints.
   * Uses deadlock-safe DELETE operations instead of TRUNCATE.
   */
  protected async cleanDatabase(): Promise<void> {
    try {
      // Use a transaction with shorter timeout to avoid long-running locks
      await this.prismaService.$transaction(
        async (prisma) => {
          // Use DELETE instead of TRUNCATE to avoid table locks
          // Order is important: child tables first, then parent tables
          const orderedTables = [
            'stock_movements',
            'service_executions',
            'budget_items',
            'budgets',
            'service_orders',
            'vehicle_evaluations',
            'vehicles',
            'services',
            'refresh_tokens',
            'users',
            'employees',
            'clients',
            'stock_items',
          ]

          for (const tableName of orderedTables) {
            try {
              await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}"`)
            } catch (error) {
              // Log but continue with other tables
              Logger.warn(`Failed to clean table ${tableName}: ${error.message}`)
            }
          }
        },
        {
          timeout: 5000, // Shorter timeout to fail fast
          isolationLevel: 'ReadCommitted',
        },
      )

      Logger.log('Database cleanup completed successfully')
    } catch (error) {
      Logger.error(`Database cleanup failed: ${error}`)
      // Fallback to individual table cleanup
      await this.fallbackCleanup()
    }
  }

  /**
   * Fallback cleanup method using individual DELETE statements
   */
  private async fallbackCleanup(): Promise<void> {
    const tables = [
      'stock_movements',
      'stock_items',
      'service_executions',
      'budget_items',
      'budgets',
      'service_orders',
      'vehicle_evaluations',
      'vehicles',
      'services',
      'refresh_tokens',
      'users',
      'employees',
      'clients',
    ]

    try {
      for (const table of tables) {
        try {
          await this.prismaService.$executeRawUnsafe(`DELETE FROM "${table}"`)
        } catch (error) {
          Logger.warn(`Failed to clean table ${table}: ${error}`)
        }
      }

      // Reset sequences for clean IDs
      const sequences = [
        'clients_id_seq',
        'employees_id_seq',
        'users_id_seq',
        'vehicles_id_seq',
        'services_id_seq',
        'service_orders_id_seq',
        'vehicle_evaluations_id_seq',
        'budgets_id_seq',
        'budget_items_id_seq',
        'stock_items_id_seq',
        'stock_movements_id_seq',
        'service_executions_id_seq',
      ]

      for (const sequence of sequences) {
        try {
          await this.prismaService.$executeRawUnsafe(`ALTER SEQUENCE "${sequence}" RESTART WITH 1`)
        } catch {
          // Sequence might not exist, ignore
        }
      }
    } catch (error) {
      Logger.error(`Fallback cleanup also failed: ${error}`)
    }
  }

  /**
   * Gets the HTTP server instance for making requests in tests.
   */
  public getHttpServer() {
    return this.app.getHttpServer()
  }

  /**
   * Creates a test database transaction that automatically rolls back.
   * Useful for testing operations that should not persist data.
   */
  protected async withTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return this.prismaService.$transaction(async () => {
      await operation()
      throw new Error('ROLLBACK')
    })
  }

  /**
   * Waits for a specified amount of time.
   * Useful for testing time-based operations.
   */
  protected async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

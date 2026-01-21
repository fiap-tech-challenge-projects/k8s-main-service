import { Logger, Type } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaMockFactory } from '@/__tests__/factories'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import { RetryService } from '@shared/services'

/**
 * Factory for creating test modules with common configurations
 */
export class TestModuleFactory {
  /**
   * Creates a test module with the provided module and optional overrides
   * ensuring infrastructure dependencies are stubbed.
   */
  static async createTestModule(
    moduleClass: new (...args: unknown[]) => unknown,
    overrides: Array<{ provide: string | symbol | Type<unknown>; useValue: unknown }> = [],
  ): Promise<TestingModule> {
    let builder = Test.createTestingModule({
      imports: [moduleClass],
      providers: [
        { provide: Logger, useValue: sharedMockLogger },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultValue?: unknown) => {
              const defaults: Record<string, unknown> = {
                'metrics.backend': 'in-memory',
                'metrics.enabled': true,
                'metrics.logLevel': 'info',
                'metrics.collectHistograms': true,
                'metrics.collectMeanTimes': true,
                'metrics.defaultLabels': {},
              }
              return defaults[key] ?? defaultValue
            },
          },
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(PrismaMockFactory.createPrismaClientMock())
      .overrideProvider(RetryService)
      .useValue({ withRetry: (operation: () => Promise<unknown>) => operation() })

    overrides.forEach(({ provide, useValue }) => {
      builder = builder.overrideProvider(provide).useValue(useValue)
    })

    return builder.compile()
  }

  /**
   * Creates a test module and returns null when DI errors occur.
   */
  static async createTestModuleWithErrorHandling(
    moduleClass: new (...args: unknown[]) => unknown,
    overrides: Array<{ provide: string | symbol | Type<unknown>; useValue: unknown }> = [],
  ): Promise<TestingModule | null> {
    try {
      return await this.createTestModule(moduleClass, overrides)
    } catch (error) {
      console.warn(
        `Failed to create test module for ${moduleClass?.name ?? 'UnknownModule'}:`,
        error instanceof Error ? error.message : String(error),
      )
      return null
    }
  }
}

/**
 * Creates a mock logger for testing
 */
export const createMockLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
})

/**
 * Shared mock logger instance for tests
 */
export const sharedMockLogger = createMockLogger()

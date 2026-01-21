// Environment setup for tests
process.env.NODE_ENV = 'test'
process.env.PORT = '3000'

// Only set DATABASE_URL if not already set (allows CI/CD to override)
// CI uses: postgresql://admin:postgres@localhost:5432/fiap_db_test
// Local uses: postgresql://postgres:postgres@localhost:5433/fiap-tech-challenge-test
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5433/fiap-tech-challenge-test?schema=public'
process.env.DIRECT_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL

// Suppress all console output during tests
console.log = jest.fn()
console.error = jest.fn()
console.warn = jest.fn()
console.info = jest.fn()
console.debug = jest.fn()

// Global logger mocking to suppress NestJS log output during tests
import { Logger } from '@nestjs/common'

// Mock all logger methods globally
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {})
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {})
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {})
jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {})
jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => {})
jest.spyOn(Logger.prototype, 'fatal').mockImplementation(() => {})

// Also override stdout/stderr write to aggressively suppress any logger output
// (some Nest logger implementations write directly to stdout/stderr)
;(process.stdout as any).write = () => true
;(process.stderr as any).write = () => true

// Mock Pino logger to suppress nestjs-pino logs
jest.mock('nestjs-pino', () => ({
  PinoLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
  })),
  LoggerErrorInterceptor: jest.fn().mockImplementation(() => ({
    intercept: jest.fn(),
  })),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
  })),
  LoggerModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class MockLoggerModule {},
      providers: [],
      exports: [],
    }),
  },
}))

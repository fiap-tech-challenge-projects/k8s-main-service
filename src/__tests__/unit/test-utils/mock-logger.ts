import { Logger } from '@nestjs/common'

export const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
}

// Logger mock for use in tests
export const setupLoggerMock = () => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error as any)
  jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log as any)
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn as any)
  jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug as any)
  jest.spyOn(Logger.prototype, 'verbose').mockImplementation(mockLogger.verbose as any)
}

export const clearLoggerMocks = () => {
  mockLogger.log.mockClear()
  mockLogger.error.mockClear()
  mockLogger.warn.mockClear()
  mockLogger.debug.mockClear()
  mockLogger.verbose.mockClear()
}

export default mockLogger

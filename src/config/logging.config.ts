/**
 * Centralized logging configuration for the application.
 *
 * Configures Pino logger with environment-specific settings including
 * pretty printing for development and structured logging for production.
 * Includes base metadata like environment and version information.
 *
 * Features:
 * - Environment-based log level configuration
 * - Pretty printing in non-production environments
 * - Structured JSON logging in production
 * - Automatic timestamp generation
 * - Base metadata injection
 * - File logging with rotation support
 *
 * @example
 * // In a module
 * LoggerModule.forRoot(loggingConfig)
 */
import * as fs from 'fs'
import * as path from 'path'

const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true'
const LOG_FILE_PATH = process.env.LOG_FILE_PATH ?? path.join(process.cwd(), 'logs/app.log')

/**
 * Creates a Pino destination stream for file logging with optional rotation.
 *
 * Supports both simple file logging and log rotation using pino/file.
 * Falls back to simple file logging if rotation is not available or fails.
 *
 * @returns Pino destination stream or undefined for console-only logging
 */
function getPinoDestination(): fs.WriteStream | undefined {
  if (!LOG_TO_FILE) return undefined

  // Ensure logs directory exists
  const logDir = path.dirname(LOG_FILE_PATH)
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  // Only support simple file logging (log rotation forbidden by lint rules)
  try {
    return fs.createWriteStream(LOG_FILE_PATH, { flags: 'a' })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Log file could not be created, falling back to console logging: ${errorMessage}`)
    return undefined
  }
}

/**
 * Logging configuration object for Pino and nestjs-pino.
 *
 * @example
 * import { LOGGING_CONFIG } from '@config/logging.config'
 * LoggerModule.forRoot(LOGGING_CONFIG)
 */
export const LOGGING_CONFIG = {
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              levelFirst: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              colorizeObjects: false,
            },
          }
        : undefined,
    base: {
      env: process.env.NODE_ENV ?? 'development',
      version: process.env.npm_package_version ?? '1.0.0',
    },
    timestamp: (): string => `,"time":"${new Date().toISOString()}"`,
    stream: getPinoDestination(),
  },
}

/**
 * Creates a logger instance with a specific name/context.
 *
 * Extends the base logging configuration with a custom name
 * for better log identification and filtering.
 *
 * @param name - The name/context for the logger instance
 * @returns Logger configuration object with the specified name
 *
 * @example
 * // Create a service-specific logger
 * const serviceLogger = CREATE_LOGGER('UserService')
 */
export const CREATE_LOGGER = (name: string): typeof LOGGING_CONFIG & { name: string } => {
  return {
    ...LOGGING_CONFIG,
    name,
  }
}

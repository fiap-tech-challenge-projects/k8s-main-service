import { Logger as WinstonLogger } from 'winston'
import * as winston from 'winston'

/**
 * Winston logger factory
 * Creates and configures Winston logger instance
 */
export class LoggerFactory {
  /**
   * Creates a new Winston logger instance
   * @param serviceName - Service name for log context
   * @param environment - Environment name
   * @param logLevel - Log level (debug, info, warn, error)
   * @returns Configured Winston logger instance
   */
  static createLogger(serviceName: string, environment: string, logLevel: string): WinstonLogger {
    const isProduction = environment === 'production'

    return winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        isProduction
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
                return `${timestamp} [${serviceName}] ${level}: ${message} ${metaString}`
              }),
            ),
      ),
      defaultMeta: { service: serviceName },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
    })
  }
}

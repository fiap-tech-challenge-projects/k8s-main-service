import { Injectable, NestMiddleware, Inject } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { Logger as WinstonLogger } from 'winston'

/**
 * HTTP request logging middleware
 * Logs all incoming HTTP requests and outgoing responses with duration tracking
 */
@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  /**
   * Creates an instance of HttpLoggingMiddleware
   * @param logger - Winston logger instance for request logging
   */
  constructor(@Inject('LOGGER') private readonly logger: WinstonLogger) {}

  /**
   * Middleware function that logs HTTP requests/responses
   * Tracks request duration and logs metadata when response is sent
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next middleware function
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now()
    const { method, url, ip } = req

    // Log response when it finishes
    res.on('finish', () => {
      const duration = Date.now() - startTime
      const { statusCode } = res

      this.logger.info('HTTP Request', {
        method,
        path: url,
        statusCode,
        ip,
        duration: `${duration}ms`,
      })
    })

    next()
  }
}

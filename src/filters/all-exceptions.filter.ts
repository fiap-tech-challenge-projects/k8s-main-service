import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import { Response, Request } from 'express'
import { Logger as WinstonLogger } from 'winston'

interface ErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  method: string
  message: string
  error?: unknown
}

/**
 * Global exception filter for handling all application exceptions
 * Logs errors and returns standardized error responses
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * Creates an instance of AllExceptionsFilter
   * @param logger - Winston logger instance
   */
  constructor(@Inject('LOGGER') private readonly logger: WinstonLogger) {}

  /**
   * Catches and handles all exceptions
   * @param exception - The caught exception
   * @param host - The arguments host containing request/response
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let error: unknown = exception

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      if (typeof exceptionResponse === 'object') {
        error = exceptionResponse
        message =
          ((exceptionResponse as Record<string, unknown>).message as string) ?? exception.message
      } else {
        message = String(exceptionResponse)
      }
    } else if (exception instanceof Error) {
      message = exception.message
      error = exception
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(process.env.NODE_ENV !== 'production' && { error }),
    }

    this.logger.error('Unhandled exception', {
      statusCode: status,
      message,
      path: request.url,
      stack: error instanceof Error ? error.stack : undefined,
    })

    response.status(status).json(errorResponse)
  }
}

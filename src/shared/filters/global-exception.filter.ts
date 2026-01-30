import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'

import { ExceptionHandlerRegistryService } from '../services'

/**
 * Standard error response structure for HTTP exceptions.
 *
 * Provides a consistent error response format across all HTTP endpoints,
 * including status code, error message, timestamp, and request path.
 *
 * @example
 * {
 *   statusCode: 400,
 *   message: 'Validation failed',
 *   timestamp: '2023-01-01T00:00:00.000Z',
 *   path: '/api/users'
 * }
 */
export interface ErrorResponse {
  /** HTTP status code */
  statusCode: number
  /** Human-readable error message */
  message: string
  /** ISO timestamp of when the error occurred */
  timestamp: string
  /** Request path where the error occurred */
  path?: string
  /** Error type/name */
  error?: string
  /** Validation errors array */
  errors?: Array<{ field: string; message: string }>
}

/**
 * Global exception filter that handles all unhandled exceptions.
 *
 * This filter catches exceptions from HTTP contexts and provides
 * appropriate error responses based on the exception type.
 *
 * Features:
 * - Automatic exception type detection
 * - Structured error logging with Logger
 * - Consistent error response formats
 * - Error code mapping for different exception types
 * - Request path tracking for HTTP errors
 * - Centralized exception handling through registry
 *
 * @example
 * // Automatically applied globally via APP_FILTER
 * {
 *   provide: APP_FILTER,
 *   useClass: GlobalExceptionFilter,
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  protected readonly logger: Logger

  /**
   * Creates a new GlobalExceptionFilter instance.
   *
   * @param exceptionRegistry - Registry service for handling different types of exceptions
   */
  constructor(private readonly exceptionRegistry: ExceptionHandlerRegistryService) {
    this.logger = this.exceptionRegistry.getLogger()
  }

  /**
   * Main exception handling method.
   *
   * Determines the context type and delegates to the appropriate handler method.
   * Logs all exceptions for debugging.
   *
   * @param exception - The caught exception
   * @param host - Arguments host providing context information
   *
   * @example
   * // This method is called automatically by NestJS
   * // when an unhandled exception occurs
   */
  catch(exception: unknown, host: ArgumentsHost) {
    // ENFORCED LOGGING
    this.logger.error('Exception caught by GlobalExceptionFilter', {
      exception: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    })

    const contextType = host.getType()

    if (contextType === 'http') {
      this.handleHttpException(exception, host)
    } else {
      // Fallback for unknown context types
      this.handleGenericException(exception, host)
    }
  }

  /**
   * Handles HTTP exceptions by sending appropriate HTTP responses.
   *
   * Creates a structured error response and sends it via Express response
   * object. Logs the HTTP-specific error details.
   *
   * @param exception - The caught exception
   * @param host - Arguments host for HTTP context
   *
   * @example
   * // Called internally when contextType === 'http'
   */
  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<{ method: string; url: string }>()

    const errorResponse = this.createHttpErrorResponse(exception, request.url)

    this.logger.error('HTTP Exception handled', {
      method: request.method,
      url: request.url,
      statusCode: errorResponse.statusCode,
      exceptionName: exception instanceof Error ? exception.name : 'Unknown',
      exceptionMessage: exception instanceof Error ? exception.message : String(exception),
    })

    response.status(errorResponse.statusCode).json(errorResponse)
  }

  /**
   * Handles generic exceptions as a fallback mechanism.
   *
   * Creates a generic error response for unknown context types.
   * Used as a safety net for unexpected exception scenarios.
   *
   * @param exception - The caught exception
   * @param host - Arguments host for context
   *
   * @example
   * // Called internally as fallback for unknown context types
   */
  private handleGenericException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<{ method: string; url: string }>()

    const errorResponse: ErrorResponse = {
      statusCode: 500,
      message: 'Internal server error',
      error: 'InternalServerError',
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    this.logger.error('Generic Exception handled', {
      method: request.method,
      url: request.url,
      statusCode: errorResponse.statusCode,
      exceptionName: exception instanceof Error ? exception.name : 'Unknown',
      exceptionMessage: exception instanceof Error ? exception.message : String(exception),
    })

    response.status(errorResponse.statusCode).json(errorResponse)
  }

  /**
   * Creates a standardized HTTP error response.
   *
   * Maps exception details to HTTP error response format including
   * status code, message, timestamp, and request path.
   *
   * @param exception - The caught exception
   * @param path - Request path where the error occurred
   * @returns Structured HTTP error response
   *
   * @example
   * const response = this.createHttpErrorResponse(exception, '/api/users');
   * // Returns ErrorResponse object
   */
  private createHttpErrorResponse(exception: unknown, path: string): ErrorResponse {
    const statusCode = this.getHttpStatusCode(exception)
    const errorText = this.getHttpStatusText(statusCode)
    let errors: Array<{ field: string; message: string }> | undefined

    // Handle validation errors from class-validator
    if (exception instanceof HttpException && typeof exception.getResponse === 'function') {
      const response = exception.getResponse()
      if (
        response &&
        typeof response === 'object' &&
        'message' in response &&
        Array.isArray((response as Record<string, unknown>).message)
      ) {
        // Check if this is a class-validator error response with detailed validation errors
        if ('errors' in response && Array.isArray((response as Record<string, unknown>).errors)) {
          errors = (
            (response as Record<string, unknown>).errors as Array<Record<string, unknown>>
          ).map((error) => ({
            field: (error.property as string) ?? '',
            message: error.constraints
              ? (Object.values(error.constraints as Record<string, string>)[0] as string)
              : ((error.message as string) ?? 'Validation failed'),
          }))
        } else {
          // Fallback to message parsing for other types of validation errors
          errors = ((response as Record<string, unknown>).message as string[]).map(
            (msg: string) => {
              // Try to extract field from message, fallback to generic
              const match = msg.match(/^(.+): (.+)$/)
              if (match) {
                return { field: match[1], message: match[2] }
              }
              return { field: '', message: msg }
            },
          )
        }
      }
    }

    return {
      statusCode,
      error: errorText,
      message: this.getMessage(exception),
      errors,
      timestamp: new Date().toISOString(),
      path,
    }
  }

  /**
   * Maps exception types to HTTP status codes.
   *
   * Delegates to the exception registry for status code resolution.
   *
   * @param exception - The caught exception
   * @returns Appropriate HTTP status code
   *
   * @example
   * const statusCode = this.getHttpStatusCode(exception);
   * // Returns HttpStatus enum value
   */
  protected getHttpStatusCode(exception: unknown): HttpStatus {
    // Handle HttpException instances directly
    if (exception instanceof HttpException) {
      return exception.getStatus()
    }

    // Handle non-Error exceptions
    if (!(exception instanceof Error)) {
      return HttpStatus.INTERNAL_SERVER_ERROR
    }

    // Delegate to exception registry
    return this.exceptionRegistry.getHttpStatusCode(exception)
  }

  /**
   * Extracts a human-readable message from an exception.
   *
   * Delegates to the exception registry for message resolution.
   *
   * @param exception - The caught exception
   * @returns Human-readable error message
   *
   * @example
   * const message = this.getMessage(exception);
   * // Returns string error message
   */
  protected getMessage(exception: unknown): string {
    // Handle HttpException instances
    if (exception instanceof HttpException) {
      return exception.message
    }

    // Handle non-Error exceptions
    if (!(exception instanceof Error)) {
      return 'Internal server error'
    }

    // Delegate to exception registry
    return this.exceptionRegistry.getErrorMessage(exception)
  }

  /**
   * Maps HTTP status codes to error text.
   *
   * @param statusCode - The HTTP status code
   * @returns Human-readable error text
   */
  private getHttpStatusText(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Bad Request'
      case 401:
        return 'Unauthorized'
      case 403:
        return 'Forbidden'
      case 404:
        return 'Not Found'
      case 409:
        return 'Conflict'
      case 422:
        return 'Unprocessable Entity'
      case 500:
        return 'Internal Server Error'
      default:
        return 'Error'
    }
  }
}

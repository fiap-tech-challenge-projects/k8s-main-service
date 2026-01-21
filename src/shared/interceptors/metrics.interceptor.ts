import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

import { MetricsService } from '../services'

function getErrorStatus(error: unknown): number {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status
  }
  return 500
}

function getErrorName(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'constructor' in error &&
    typeof (error as { constructor: { name: string } }).constructor?.name === 'string'
  ) {
    return (error as { constructor: { name: string } }).constructor.name
  }
  return 'Error'
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  return String(error)
}

/**
 * Interceptor for tracking HTTP request performance metrics.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name)

  /**
   * Creates a new MetricsInterceptor instance.
   *
   * @param metricsService - The metrics service for tracking performance data
   */
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Intercept HTTP requests and track performance metrics.
   *
   * @param context - The execution context containing request/response
   * @param next - The call handler for the next middleware
   * @returns Observable with performance tracking
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest() as {
      method: string
      url: string
      headers: Record<string, string>
      ip?: string
      socket?: { remoteAddress?: string }
    }
    const response = context.switchToHttp().getResponse() as { statusCode: number }
    const startTime = Date.now()

    const method = request.method
    const url = request.url
    const userAgent = request.headers['user-agent'] ?? 'unknown'
    const ip = request.ip ?? request.socket?.remoteAddress ?? 'unknown'

    this.logger.debug('Starting request performance tracking', {
      method,
      url,
      userAgent,
      ip,
    })

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000
          const statusCode = response.statusCode

          this.metricsService.trackHttpRequest(method, url, statusCode, duration)

          this.metricsService.trackBusinessMetric('requests_total', 1, {
            method,
            endpoint: url,
            status: statusCode.toString(),
          })

          this.logger.debug('Request completed successfully', {
            method,
            url,
            statusCode,
            duration: `${duration.toFixed(3)}s`,
            userAgent,
            ip,
          })
        },
        error: (error: unknown) => {
          const duration = (Date.now() - startTime) / 1000
          const statusCode = getErrorStatus(error)

          this.metricsService.trackHttpRequest(method, url, statusCode, duration)
          this.metricsService.trackBusinessMetric('errors_total', 1, {
            method,
            endpoint: url,
            status: statusCode.toString(),
            error: getErrorName(error),
          })

          this.logger.error('Request failed', {
            method,
            url,
            statusCode,
            duration: `${duration.toFixed(3)}s`,
            error: getErrorMessage(error),
            userAgent,
            ip,
          })
        },
      }),
    )
  }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable, tap, catchError } from 'rxjs'

/**
 * Interceptor for logging HTTP requests and responses with structured logs.
 *
 * @example
 * // In main.ts
 * app.useGlobalInterceptors(new LoggingInterceptor())
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  /**
   * Intercepts HTTP requests and logs request/response lifecycle.
   *
   * @param context - The execution context
   * @param next - The call handler
   * @returns Observable<any> - The observable stream
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest() as { method: string; url: string }
    const { method, url } = req
    const now = Date.now()

    this.logger.log(
      JSON.stringify({
        message: 'Request received',
        method,
        url,
      }),
    )

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse() as { statusCode: number }
        this.logger.log(
          JSON.stringify({
            message: 'Response sent',
            method,
            url,
            statusCode: res.statusCode,
            duration: Date.now() - now,
          }),
        )
      }),
      catchError((err: unknown) => {
        const logObj: Record<string, unknown> = {
          message: 'Request error',
          method,
          url,
        }
        if (err && typeof err === 'object' && 'message' in err) {
          logObj.error = (err as { message: string }).message
          logObj.stack = (err as { stack?: string }).stack
        } else {
          logObj.error = err
        }
        this.logger.error(JSON.stringify(logObj))
        throw err
      }),
    )
  }
}

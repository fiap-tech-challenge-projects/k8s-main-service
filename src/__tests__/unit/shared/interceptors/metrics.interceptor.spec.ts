import { CallHandler, ExecutionContext, Logger } from '@nestjs/common'
import { of, throwError } from 'rxjs'

import { MetricsInterceptor, MetricsService } from '@shared'

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor
  let metrics: MetricsService

  beforeEach(() => {
    metrics = {
      trackHttpRequest: jest.fn(),
      trackBusinessMetric: jest.fn(),
    } as unknown as MetricsService
    interceptor = new MetricsInterceptor(metrics)
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()
    jest.spyOn(Logger.prototype, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  function ctx(status = 200): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/users',
          headers: { 'user-agent': 'jest' },
          ip: '127.0.0.1',
        }),
        getResponse: () => ({ statusCode: status }),
      }),
    } as unknown as ExecutionContext
  }

  it('tracks on success', (done) => {
    const next: CallHandler = { handle: () => of('ok') }
    interceptor.intercept(ctx(200), next).subscribe({
      next: () => {
        expect(metrics.trackHttpRequest).toHaveBeenCalled()
        expect(metrics.trackBusinessMetric).toHaveBeenCalledWith('requests_total', 1, {
          method: 'GET',
          endpoint: '/users',
          status: '200',
        })
        done()
      },
    })
  })

  it('tracks on error', (done) => {
    const error = Object.assign(new Error('fail'), { status: 503 })
    const next: CallHandler = { handle: () => throwError(() => error) }
    interceptor.intercept(ctx(200), next).subscribe({
      error: () => {
        expect(metrics.trackHttpRequest).toHaveBeenCalled()
        expect(metrics.trackBusinessMetric).toHaveBeenCalledWith('errors_total', 1, {
          method: 'GET',
          endpoint: '/users',
          status: '503',
          error: 'Error',
        })
        done()
      },
    })
  })
})

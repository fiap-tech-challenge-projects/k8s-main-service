import { CallHandler, ExecutionContext, Logger } from '@nestjs/common'
import { of, throwError } from 'rxjs'

import { LoggingInterceptor } from '@shared'

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor

  beforeEach(() => {
    interceptor = new LoggingInterceptor()
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  function createContext(status = 200) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test' }),
        getResponse: () => ({ statusCode: status }),
      }),
    } as unknown as ExecutionContext
  }

  it('should log request and response on success', (done) => {
    const ctx = createContext(201)
    const next: CallHandler = { handle: () => of('ok') }
    const logSpy = jest.spyOn(Logger.prototype, 'log')

    interceptor.intercept(ctx, next).subscribe({
      next: () => {
        expect(logSpy).toHaveBeenCalled()
        done()
      },
    })
  })

  it('should log error on failure and rethrow', (done) => {
    const ctx = createContext(500)
    const error = new Error('boom')
    const next: CallHandler = { handle: () => throwError(() => error) }
    const errSpy = jest.spyOn(Logger.prototype, 'error')

    interceptor.intercept(ctx, next).subscribe({
      error: (e) => {
        expect(errSpy).toHaveBeenCalled()
        expect(e).toBe(error)
        done()
      },
    })
  })
})

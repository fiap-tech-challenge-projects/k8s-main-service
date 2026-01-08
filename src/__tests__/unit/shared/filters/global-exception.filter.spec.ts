import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'

import { GlobalExceptionFilter } from '@shared/filters'
import { ExceptionHandlerRegistryService } from '@shared/services'

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter
  let mockRegistry: jest.Mocked<ExceptionHandlerRegistryService>
  let mockLogger: jest.Mocked<Logger>

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any

    mockRegistry = {
      getHttpStatusCode: jest.fn(),
      getErrorMessage: jest.fn(),
      getLogger: jest.fn().mockReturnValue(mockLogger),
    } as any

    filter = new GlobalExceptionFilter(mockRegistry)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  function createHost() {
    const statusMock = jest.fn().mockReturnThis()
    const jsonMock = jest.fn()
    const response = { status: statusMock, json: jsonMock } as unknown as Response
    const request = { method: 'GET', url: '/test' }
    const host = {
      getType: () => 'http',
      switchToHttp: () => ({ getResponse: () => response, getRequest: () => request }),
    } as unknown as ArgumentsHost
    return { host, statusMock, jsonMock, request }
  }

  describe('catch', () => {
    it('should handle HTTP exceptions correctly', () => {
      const { host, statusMock, jsonMock } = createHost()
      const exception = new Error('Test error')
      exception.name = 'TestException'
      mockRegistry.getHttpStatusCode.mockReturnValue(400)
      mockRegistry.getErrorMessage.mockReturnValue('Test error message')

      filter.catch(exception, host)

      expect(mockLogger.error).toHaveBeenCalledWith('Exception caught by GlobalExceptionFilter', {
        exception: 'Test error',
        stack: exception.stack,
      })
      expect(mockRegistry.getHttpStatusCode).toHaveBeenCalledWith(exception)
      expect(mockRegistry.getErrorMessage).toHaveBeenCalledWith(exception)
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Test error message',
        timestamp: expect.any(String),
        path: '/test',
      })
    })

    it('should handle HttpException instances directly', () => {
      const { host, statusMock, jsonMock } = createHost()
      const exception = new HttpException('Http error', HttpStatus.BAD_REQUEST)

      filter.catch(exception, host)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Http error',
        timestamp: expect.any(String),
        path: '/test',
      })
    })

    it('should handle validation errors with field details', () => {
      const { host, statusMock, jsonMock } = createHost()
      const validationResponse = {
        message: ['name: Name is required', 'email: Email is invalid'],
      }
      const exception = new HttpException(validationResponse, HttpStatus.BAD_REQUEST)

      filter.catch(exception, host)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Http Exception',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Email is invalid' },
        ],
        timestamp: expect.any(String),
        path: '/test',
      })
    })

    it('should handle validation errors without field details', () => {
      const { host, statusMock, jsonMock } = createHost()
      const validationResponse = {
        message: ['Name is required', 'Email is invalid'],
      }
      const exception = new HttpException(validationResponse, HttpStatus.BAD_REQUEST)

      filter.catch(exception, host)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Http Exception',
        errors: [
          { field: '', message: 'Name is required' },
          { field: '', message: 'Email is invalid' },
        ],
        timestamp: expect.any(String),
        path: '/test',
      })
    })

    it('should handle non-HTTP context types', () => {
      const { host, statusMock, jsonMock } = createHost()
      const exception = new Error('Test error')
      ;(host as any).getType = () => 'rpc'

      filter.catch(exception, host)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Internal server error',
        error: 'InternalServerError',
        timestamp: expect.any(String),
        path: '/test',
      })
    })

    it('should handle non-Error exceptions', () => {
      const { host, statusMock, jsonMock } = createHost()
      const exception = 'String error'

      filter.catch(exception, host)

      expect(mockLogger.error).toHaveBeenCalledWith('Exception caught by GlobalExceptionFilter', {
        exception: 'String error',
        stack: undefined,
      })
      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        errors: undefined,
        timestamp: expect.any(String),
        path: '/test',
      })
    })

    it('should log HTTP exception details', () => {
      const { host } = createHost()
      const exception = new Error('Test error')
      mockRegistry.getHttpStatusCode.mockReturnValue(404)
      mockRegistry.getErrorMessage.mockReturnValue('Not found')

      filter.catch(exception, host)

      expect(mockLogger.error).toHaveBeenCalledWith('HTTP Exception handled', {
        method: 'GET',
        url: '/test',
        statusCode: 404,
        exceptionName: 'Error',
        exceptionMessage: 'Test error',
      })
    })
  })

  describe('getHttpStatusText', () => {
    it('should return correct status text for known status codes', () => {
      const testCases = [
        { code: 400, expected: 'Bad Request' },
        { code: 401, expected: 'Unauthorized' },
        { code: 403, expected: 'Forbidden' },
        { code: 404, expected: 'Not Found' },
        { code: 409, expected: 'Conflict' },
        { code: 422, expected: 'Unprocessable Entity' },
        { code: 500, expected: 'Internal Server Error' },
      ]

      testCases.forEach(({ code, expected }) => {
        const result = (filter as any).getHttpStatusText(code)
        expect(result).toBe(expected)
      })
    })

    it('should return "Error" for unknown status codes', () => {
      const result = (filter as any).getHttpStatusText(999)
      expect(result).toBe('Error')
    })
  })
})

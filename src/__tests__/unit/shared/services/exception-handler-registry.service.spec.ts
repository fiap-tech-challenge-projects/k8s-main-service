import { Test, TestingModule } from '@nestjs/testing'

import {
  BusinessExceptionHandlerService,
  PrismaErrorHandlerService,
  ExceptionHandlerRegistryService,
} from '@shared/services'

describe('ExceptionHandlerRegistryService', () => {
  let service: ExceptionHandlerRegistryService
  let businessHandler: jest.Mocked<BusinessExceptionHandlerService>
  let prismaHandler: jest.Mocked<PrismaErrorHandlerService>

  beforeEach(async () => {
    const mockBusinessHandler = {
      getHttpStatusCode: jest.fn(),
      getErrorMessage: jest.fn(),
    }

    const mockPrismaHandler = {
      getHttpStatusCode: jest.fn(),
      getErrorMessage: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExceptionHandlerRegistryService,
        {
          provide: BusinessExceptionHandlerService,
          useValue: mockBusinessHandler,
        },
        {
          provide: PrismaErrorHandlerService,
          useValue: mockPrismaHandler,
        },
      ],
    }).compile()

    service = module.get<ExceptionHandlerRegistryService>(ExceptionHandlerRegistryService)
    businessHandler = module.get(BusinessExceptionHandlerService)
    prismaHandler = module.get(PrismaErrorHandlerService)
  })

  describe('getHttpStatusCode', () => {
    it('should delegate to Prisma handler when it returns non-500 status', () => {
      const exception = new Error('Prisma error')
      prismaHandler.getHttpStatusCode.mockReturnValue(409)
      businessHandler.getHttpStatusCode.mockReturnValue(404)

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(409)
      expect(prismaHandler.getHttpStatusCode).toHaveBeenCalledWith(exception)
      expect(businessHandler.getHttpStatusCode).not.toHaveBeenCalled()
    })

    it('should delegate to business handler when Prisma handler returns 500', () => {
      const exception = new Error('Business error')
      prismaHandler.getHttpStatusCode.mockReturnValue(500)
      businessHandler.getHttpStatusCode.mockReturnValue(404)

      const result = service.getHttpStatusCode(exception)

      expect(result).toBe(404)
      expect(prismaHandler.getHttpStatusCode).toHaveBeenCalledWith(exception)
      expect(businessHandler.getHttpStatusCode).toHaveBeenCalledWith(exception)
    })
  })

  describe('getErrorMessage', () => {
    it('should delegate to Prisma handler when it returns non-default message', () => {
      const exception = new Error('Prisma error')
      prismaHandler.getErrorMessage.mockReturnValue('Unique constraint violation')
      businessHandler.getErrorMessage.mockReturnValue('Business error')

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Unique constraint violation')
      expect(prismaHandler.getErrorMessage).toHaveBeenCalledWith(exception)
      expect(businessHandler.getErrorMessage).not.toHaveBeenCalled()
    })

    it('should delegate to business handler when Prisma handler returns default message', () => {
      const exception = new Error('Business error')
      prismaHandler.getErrorMessage.mockReturnValue('Database error')
      businessHandler.getErrorMessage.mockReturnValue('Custom business error')

      const result = service.getErrorMessage(exception)

      expect(result).toBe('Custom business error')
      expect(prismaHandler.getErrorMessage).toHaveBeenCalledWith(exception)
      expect(businessHandler.getErrorMessage).toHaveBeenCalledWith(exception)
    })
  })

  describe('getLogger', () => {
    it('should return a logger instance', () => {
      const logger = service.getLogger()

      expect(logger).toBeDefined()
      expect(typeof logger.log).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.debug).toBe('function')
    })
  })
})

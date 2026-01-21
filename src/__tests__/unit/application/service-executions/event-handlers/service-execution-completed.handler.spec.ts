import { GetClientByIdUseCase } from '@application/clients/use-cases'
import { ServiceExecutionCompletedHandler } from '@application/event-handlers/service-executions'
import { Success, Failure } from '@shared/types'

describe('ServiceExecutionCompletedHandler', () => {
  let handler: ServiceExecutionCompletedHandler
  let mockEmailService: any
  let mockGetClientByIdUseCase: jest.Mocked<GetClientByIdUseCase>
  let loggerSpy: jest.SpyInstance

  beforeEach(() => {
    mockEmailService = {}
    mockGetClientByIdUseCase = {
      execute: jest.fn(),
    } as any
    handler = new ServiceExecutionCompletedHandler(mockEmailService, mockGetClientByIdUseCase)
    loggerSpy = jest.spyOn((handler as any).logger, 'log').mockImplementation(() => {})
    jest.spyOn((handler as any).logger, 'warn').mockImplementation(() => {})
    jest.spyOn((handler as any).logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(handler).toBeDefined()
  })

  it('should handle event and send notification (success)', async () => {
    const event = {
      data: {
        serviceOrderId: 'so1',
        clientId: 'c1',
        completedAt: new Date(),
        durationInMinutes: 30,
      },
    }
    const client = {
      id: 'c1',
      name: 'Test',
      email: 'test@example.com',
      cpfCnpj: '123.456.789-00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockGetClientByIdUseCase.execute.mockResolvedValue(new Success(client))
    const sendSpy = jest
      .spyOn<any, any>(handler as any, 'sendCompletionNotification')
      .mockResolvedValue(undefined)
    await handler.handle(event as any)
    expect(mockGetClientByIdUseCase.execute).toHaveBeenCalledWith('c1')
    expect(sendSpy).toHaveBeenCalledWith(client, expect.objectContaining({ serviceOrderId: 'so1' }))
    expect(loggerSpy).toHaveBeenCalled()
  })

  it('should warn and return if client not found', async () => {
    const event = {
      data: {
        serviceOrderId: 'so1',
        clientId: 'c1',
        completedAt: new Date(),
      },
    }
    mockGetClientByIdUseCase.execute.mockResolvedValue(new Failure(new Error('Client not found')))
    const warnSpy = jest.spyOn((handler as any).logger, 'warn')
    await handler.handle(event as any)
    expect(warnSpy).toHaveBeenCalledWith(
      'Client c1 not found for service execution completion notification: Client not found',
    )
  })

  it('should log error and throw if send notification fails', async () => {
    const event = {
      data: {
        serviceOrderId: 'so1',
        clientId: 'c1',
        completedAt: new Date(),
      },
    }
    const client = {
      id: 'c1',
      name: 'Test',
      email: 'test@example.com',
      cpfCnpj: '123.456.789-00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockGetClientByIdUseCase.execute.mockResolvedValue(new Success(client))
    jest
      .spyOn<any, any>(handler as any, 'sendCompletionNotification')
      .mockRejectedValue(new Error('fail'))
    const errorSpy = jest.spyOn((handler as any).logger, 'error')
    await expect(handler.handle(event as any)).rejects.toThrow('fail')
    expect(errorSpy).toHaveBeenCalled()
  })

  it('should handle event and send notification without durationInMinutes', async () => {
    const event = {
      data: {
        serviceOrderId: 'so2',
        clientId: 'c2',
        completedAt: new Date(),
        // durationInMinutes is undefined
      },
    }
    const client = {
      id: 'c2',
      name: 'NoDuration',
      email: 'noduration@example.com',
      cpfCnpj: '123.456.789-00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockGetClientByIdUseCase.execute.mockResolvedValue(new Success(client))
    const sendSpy = jest
      .spyOn<any, any>(handler as any, 'sendCompletionNotification')
      .mockResolvedValue(undefined)
    await handler.handle(event as any)
    expect(mockGetClientByIdUseCase.execute).toHaveBeenCalledWith('c2')
    expect(sendSpy).toHaveBeenCalledWith(client, expect.objectContaining({ serviceOrderId: 'so2' }))
  })

  it('should log error and throw if clientService.getById throws', async () => {
    const event = {
      data: {
        serviceOrderId: 'so3',
        clientId: 'c3',
        completedAt: new Date(),
      },
    }
    mockGetClientByIdUseCase.execute.mockRejectedValue(new Error('client fail'))
    const errorSpy = jest.spyOn((handler as any).logger, 'error')
    await expect(handler.handle(event as any)).rejects.toThrow('client fail')
    expect(errorSpy).toHaveBeenCalled()
  })
})

import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { StartServiceExecutionUseCase } from '@application/service-executions/use-cases'

describe('StartServiceExecutionUseCase', () => {
  it('returns Success when execution started', async () => {
    const execution = { id: 'se-1', updateStartedExecution: jest.fn() }
    const repo = {
      findById: jest.fn().mockResolvedValue(execution),
      update: jest.fn().mockResolvedValue({ id: 'se-1', status: 'started' }),
    }
    const userContextService = {
      getUserId: jest.fn().mockReturnValue('u-1'),
    }

    jest
      .spyOn(ServiceExecutionMapper, 'toResponseDto')
      .mockReturnValue({ id: 'se-1', status: 'started' } as any)

    const useCase = new StartServiceExecutionUseCase(repo as any, userContextService as any)
    const res = await useCase.execute('se-1')

    expect(res.isSuccess).toBe(true)
  })

  it('returns Failure when execution not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const userContextService = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new StartServiceExecutionUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('x')
    expect(res.isFailure).toBe(true)
  })
})

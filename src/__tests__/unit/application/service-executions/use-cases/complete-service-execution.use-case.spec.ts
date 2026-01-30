import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { CompleteServiceExecutionUseCase } from '@application/service-executions/use-cases'

describe('CompleteServiceExecutionUseCase', () => {
  it('returns Success when service execution exists and completed', async () => {
    const serviceExecution = { id: 'se-1', updateCompletedExecution: jest.fn() }
    const repo = {
      findById: jest.fn().mockResolvedValue(serviceExecution),
      update: jest.fn().mockResolvedValue({ id: 'se-1', status: 'COMPLETED' }),
    }

    jest.spyOn(ServiceExecutionMapper, 'toResponseDto').mockReturnValue({ id: 'se-1' } as any)

    const useCase = new CompleteServiceExecutionUseCase(repo as any)
    const res = await useCase.execute('se-1', 'done')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('se-1')
  })

  it('returns Failure when service execution not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new CompleteServiceExecutionUseCase(repo as any)

    const res = await useCase.execute('se-1', 'notes')
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repo.update throws', async () => {
    const serviceExecution = { id: 'se-1', updateCompletedExecution: jest.fn() }
    const repo = {
      findById: jest.fn().mockResolvedValue(serviceExecution),
      update: jest.fn().mockRejectedValue(new Error('update fail')),
    }

    const useCase = new CompleteServiceExecutionUseCase(repo as any)
    const res = await useCase.execute('se-1', 'notes')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect((res as any).error).toBeInstanceOf(Error)
  })
})

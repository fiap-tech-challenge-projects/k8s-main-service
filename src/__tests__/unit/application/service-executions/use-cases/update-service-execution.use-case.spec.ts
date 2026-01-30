import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { UpdateServiceExecutionUseCase } from '@application/service-executions/use-cases'

describe('UpdateServiceExecutionUseCase', () => {
  it('returns Success when existing service execution is updated', async () => {
    const existing = { id: 'se-1', updateNotes: jest.fn() }
    const repo = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 'se-1', notes: 'ok' }),
    }

    jest
      .spyOn(ServiceExecutionMapper, 'fromUpdateDto')
      .mockImplementation((dto: any, ex: any) => ({ ...ex, ...dto }))
    jest
      .spyOn(ServiceExecutionMapper, 'toResponseDto')
      .mockReturnValue({ id: 'se-1', notes: 'ok' } as any)

    const useCase = new UpdateServiceExecutionUseCase(repo as any)
    const res = await useCase.execute('se-1', { notes: 'ok' } as any)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('se-1')
  })

  it('returns Failure when service execution not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new UpdateServiceExecutionUseCase(repo as any)

    const res = await useCase.execute('missing', { notes: 'x' } as any)
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repository throws', async () => {
    const repo = { findById: jest.fn().mockRejectedValue(new Error('db')) }
    const useCase = new UpdateServiceExecutionUseCase(repo as any)

    const res = await useCase.execute('se-1', { notes: 'x' } as any)
    expect(res.isFailure).toBe(true)
  })
})

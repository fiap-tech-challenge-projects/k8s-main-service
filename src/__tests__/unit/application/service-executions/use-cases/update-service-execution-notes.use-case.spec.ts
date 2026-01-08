import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { UpdateServiceExecutionNotesUseCase } from '@application/service-executions/use-cases'

describe('UpdateServiceExecutionNotesUseCase', () => {
  it('returns Success when service execution exists and notes updated', async () => {
    const serviceExecution = { id: 'se-1', updateNotes: jest.fn() }
    const repo = {
      findById: jest.fn().mockResolvedValue(serviceExecution),
      update: jest.fn().mockResolvedValue({ id: 'se-1', notes: 'new' }),
    }

    jest.spyOn(ServiceExecutionMapper, 'toResponseDto').mockReturnValue({ id: 'se-1' } as any)

    const useCase = new UpdateServiceExecutionNotesUseCase(repo as any)
    const res = await useCase.execute('se-1', 'new')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('se-1')
  })

  it('returns Failure when service execution not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new UpdateServiceExecutionNotesUseCase(repo as any)

    const res = await useCase.execute('se-1', 'notes')
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repo.update throws', async () => {
    const se = { id: 'se-1', updateNotes: jest.fn() }
    const repo = {
      findById: jest.fn().mockResolvedValue(se),
      update: jest.fn().mockRejectedValue(new Error('update fail')),
    }

    const uc = new UpdateServiceExecutionNotesUseCase(repo as any)
    const res = await uc.execute('se-1', 'notes')

    expect(res.isFailure).toBe(true)
  })
})

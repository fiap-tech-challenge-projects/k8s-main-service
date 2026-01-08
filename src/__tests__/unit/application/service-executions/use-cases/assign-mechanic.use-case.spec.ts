import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { AssignMechanicUseCase } from '@application/service-executions/use-cases'

describe('AssignMechanicUseCase', () => {
  it('returns Success when service execution exists and is updated', async () => {
    const serviceExecution = { id: 'se-1', updateAssignedMechanic: jest.fn() }
    const repo = {
      findById: jest.fn().mockResolvedValue(serviceExecution),
      update: jest.fn().mockResolvedValue({ id: 'se-1', assignedMechanic: 'm-1' }),
    }

    jest.spyOn(ServiceExecutionMapper, 'toResponseDto').mockReturnValue({ id: 'se-1' } as any)

    const useCase = new AssignMechanicUseCase(repo as any)
    const res = await useCase.execute('se-1', 'm-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('se-1')
    expect(repo.findById).toHaveBeenCalledWith('se-1')
  })

  it('returns Failure when service execution not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new AssignMechanicUseCase(repo as any)

    const res = await useCase.execute('se-1', 'm-1')
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repo.findById rejects', async () => {
    const repo = { findById: jest.fn().mockRejectedValue(new Error('db')) }
    const useCase = new AssignMechanicUseCase(repo as any)

    const res = await useCase.execute('se-1', 'm-1')
    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect(res.error.message).toBe('db')
  })
})

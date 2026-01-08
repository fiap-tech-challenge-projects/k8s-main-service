import { EmployeeMapper } from '@application/employees/mappers'
import { DeactivateEmployeeUseCase } from '@application/employees/use-cases'

describe('DeactivateEmployeeUseCase', () => {
  it('returns Success when employee deactivated', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'e-1', deactivate: jest.fn() }),
      update: jest.fn().mockResolvedValue({ id: 'e-1', active: false }),
    }
    const userContextService = {
      getUserId: jest.fn().mockReturnValue('u-1'),
    }
    jest
      .spyOn(EmployeeMapper, 'toResponseDto')
      .mockReturnValue({ id: 'e-1', email: 'x@y.com' } as any)

    const useCase = new DeactivateEmployeeUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('e-1')
    expect(res.isSuccess).toBe(true)
  })

  it('returns Failure when employee not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const userContextService = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new DeactivateEmployeeUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('x')
    expect(res.isFailure).toBe(true)
  })
})

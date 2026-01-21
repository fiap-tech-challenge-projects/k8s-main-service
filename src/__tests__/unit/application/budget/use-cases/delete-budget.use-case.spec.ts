import { DeleteBudgetUseCase } from '@application/budget/use-cases'

describe('DeleteBudgetUseCase', () => {
  it('returns Success when budget exists and deleted', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'b-1' }),
      delete: jest.fn().mockResolvedValue(true),
    }
    const userContextService = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new DeleteBudgetUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('b-1')
    expect(res.isSuccess).toBe(true)
  })

  it('returns Failure when not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const userContextService = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new DeleteBudgetUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('b-1')
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repo.delete throws', async () => {
    const budget = { id: 'b-1' }
    const repo = {
      findById: jest.fn().mockResolvedValue(budget),
      delete: jest.fn().mockRejectedValue(new Error('db')),
    }
    const user = { getUserId: jest.fn().mockReturnValue('u-1') }
    const uc = new DeleteBudgetUseCase(repo as any, user as any)

    const res = await uc.execute('b-1')
    expect(res.isFailure).toBe(true)
  })
})

import { DeleteBudgetItemUseCase } from '@application/budget-items/use-cases'

describe('DeleteBudgetItemUseCase', () => {
  it('returns Success when item exists and deleted', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'bi-1' }),
      delete: jest.fn().mockResolvedValue(true),
    }
    const userContextService = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new DeleteBudgetItemUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('bi-1')
    expect(res.isSuccess).toBe(true)
  })

  it('returns Failure when not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const userContextService = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new DeleteBudgetItemUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('bi-1')
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repo.delete throws', async () => {
    const item = { id: 'bi-1' }
    const repo = {
      findById: jest.fn().mockResolvedValue(item),
      delete: jest.fn().mockRejectedValue(new Error('db')),
    }
    const user = { getUserId: jest.fn().mockReturnValue('u-1') }
    const uc = new DeleteBudgetItemUseCase(repo as any, user as any)

    const res = await uc.execute('bi-1')
    expect(res.isFailure).toBe(true)
  })
})

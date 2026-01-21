import { CheckBudgetExpirationUseCase } from '@application/budget/use-cases'

describe('CheckBudgetExpirationUseCase', () => {
  it('returns Success when budget not expired', async () => {
    const repo = { findById: jest.fn().mockResolvedValue({ id: 'b-1', isExpired: () => false }) }
    const userContextService = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new CheckBudgetExpirationUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('b-1')
    expect(res.isSuccess).toBe(true)
  })

  it('returns Failure when repository throws', async () => {
    const repo = { findById: jest.fn().mockRejectedValue(new Error('db')) }
    const userContextService = { getUserId: jest.fn().mockReturnValue('u-1') }
    const useCase = new CheckBudgetExpirationUseCase(repo as any, userContextService as any)

    const res = await useCase.execute('b-1')
    expect(res.isFailure).toBe(true)
  })
})

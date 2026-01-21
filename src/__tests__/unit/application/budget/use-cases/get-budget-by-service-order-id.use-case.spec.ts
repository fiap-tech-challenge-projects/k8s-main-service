import { BudgetMapper } from '@application/budget/mappers'
import { GetBudgetByServiceOrderIdUseCase } from '@application/budget/use-cases'

describe('GetBudgetByServiceOrderIdUseCase', () => {
  const userContext: any = { getUserId: jest.fn().mockReturnValue('u-1') }

  beforeEach(() => jest.clearAllMocks())

  it('returns Success(null) when no budget found', async () => {
    const repo: any = { findByServiceOrderId: jest.fn().mockResolvedValue(null) }
    const uc = new GetBudgetByServiceOrderIdUseCase(repo as any, userContext as any)

    const res = await uc.execute('so-1')
    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toBeNull()
  })

  it('returns Success with dto when budget found', async () => {
    const budget = { id: 'b-1' }
    const repo: any = { findByServiceOrderId: jest.fn().mockResolvedValue(budget) }
    jest.spyOn(BudgetMapper, 'toResponseDto').mockReturnValue(budget as any)

    const uc = new GetBudgetByServiceOrderIdUseCase(repo as any, userContext as any)
    const res = await uc.execute('so-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toEqual(budget)
  })

  it('returns Failure when repository throws', async () => {
    const repo: any = { findByServiceOrderId: jest.fn().mockRejectedValue(new Error('db')) }
    const uc = new GetBudgetByServiceOrderIdUseCase(repo as any, userContext as any)

    const res = await uc.execute('so-1')
    expect(res.isFailure).toBe(true)
  })
})

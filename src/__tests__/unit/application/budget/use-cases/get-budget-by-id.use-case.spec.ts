import { BudgetMapper } from '@application/budget/mappers'
import { GetBudgetByIdUseCase } from '@application/budget/use-cases'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { Success } from '@shared/types'

describe('GetBudgetByIdUseCase (unit)', () => {
  let mockRepo: any
  let mockUserContext: any
  let useCase: GetBudgetByIdUseCase

  beforeEach(() => {
    mockRepo = { findById: jest.fn() }
    mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }

    jest.spyOn(BudgetMapper, 'toResponseDto').mockImplementation(
      (b: any) =>
        ({
          id: b.id,
          clientId: b.clientId ?? null,
          totalAmount: b.totalAmount ?? 0,
        }) as any,
    )

    useCase = new GetBudgetByIdUseCase(mockRepo, mockUserContext)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Failure when budget not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const result = await useCase.execute('missing-id')

    expect(result.isFailure).toBeTruthy()
    if (result.isFailure) {
      expect(result.error).toBeInstanceOf(BudgetNotFoundException)
    }
  })

  it('returns Success with response dto when repository finds budget', async () => {
    const budget = { id: 'b1', clientId: 'c1', totalAmount: 100 }
    mockRepo.findById.mockResolvedValue(budget)

    const result = await useCase.execute('b1')

    expect(mockRepo.findById).toHaveBeenCalledWith('b1')
    expect(result.isSuccess).toBeTruthy()
    expect((result as Success<any>).value.id).toBe('b1')
  })

  it('returns Failure when repository throws an error', async () => {
    // simulate repository throwing a DomainException
    const err = new Error('db fail')
    mockRepo.findById.mockRejectedValue(err)

    const result = await useCase.execute('b2')

    expect(result.isFailure).toBeTruthy()
    if (result.isFailure) {
      // when a non-DomainException is thrown, the use case wraps to BudgetNotFoundException
      expect(result.error).toBeInstanceOf(BudgetNotFoundException)
    }
  })
})

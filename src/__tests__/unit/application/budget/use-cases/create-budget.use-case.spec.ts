import { BudgetMapper } from '@application/budget/mappers'
import { CreateBudgetUseCase } from '@application/budget/use-cases'
import { Success } from '@shared/types'

describe('CreateBudgetUseCase (unit)', () => {
  const mockDto: any = { clientId: 'c1', vehicleId: 'v1', items: [] }

  let mockRepo: any
  let mockUserContext: any
  let useCase: CreateBudgetUseCase

  beforeEach(() => {
    mockRepo = { create: jest.fn() }
    mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }

    jest.spyOn(BudgetMapper, 'fromCreateDto').mockReturnValue({ clientId: 'c1', items: [] } as any)
    jest.spyOn(BudgetMapper, 'toResponseDto').mockImplementation(
      (b: any) =>
        ({
          id: b.id,
          status: b.status ?? 'GENERATED',
          totalAmount: 0,
          validityPeriod: null,
          generationDate: new Date().toISOString(),
          serviceOrderId: null,
          clientId: 'c1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          client: null,
          items: [],
        }) as any,
    )

    useCase = new CreateBudgetUseCase(mockRepo, mockUserContext)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Success with response dto when repository.create succeeds', async () => {
    const saved = { id: 'budget-1', serviceOrderId: null, status: 'GENERATED' }
    mockRepo.create.mockResolvedValue(saved)

    const result = await useCase.execute(mockDto)

    expect(mockRepo.create).toHaveBeenCalled()
    expect(result.isSuccess).toBeTruthy()
    expect((result as Success<any>).value.id).toBe('budget-1')
  })

  it('returns Failure when repository.create throws', async () => {
    mockRepo.create.mockRejectedValue(new Error('db error'))

    const result = await useCase.execute(mockDto)

    expect(result.isFailure).toBeTruthy()
  })
})

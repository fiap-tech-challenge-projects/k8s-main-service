import { Logger } from '@nestjs/common'

import { BudgetItemMapper } from '@application/budget-items/mappers'
import { GetBudgetItemsByBudgetIdUseCase } from '@application/budget-items/use-cases'
import { Success, Failure } from '@shared/types'

describe('GetBudgetItemsByBudgetIdUseCase (pure unit)', () => {
  let useCase: GetBudgetItemsByBudgetIdUseCase
  const mockBudgetItemRepository = { findByBudgetId: jest.fn() }
  const mockUserContextService = { getUserId: jest.fn() }

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)

    mockBudgetItemRepository.findByBudgetId.mockReset()
    mockUserContextService.getUserId.mockReset()

    useCase = new GetBudgetItemsByBudgetIdUseCase(
      // we only need the findByBudgetId method on the repository mock
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mockBudgetItemRepository,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mockUserContextService,
    )
  })

  afterAll(() => jest.restoreAllMocks())

  it('returns Success with mapped items when repository returns data', async () => {
    const budgetId = 'budget-1'
    const userId = 'user-42'

    mockUserContextService.getUserId.mockReturnValue(userId)

    const domainItem = {
      id: 'item-1',
      type: 'material',
      description: 'desc',
      quantity: 2,
      getFormattedUnitPrice: () => 10,
      getFormattedTotalPrice: () => 20,
      budgetId,
      notes: null,
      stockItemId: null,
      serviceId: null,
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2020-01-02'),
    }

    mockBudgetItemRepository.findByBudgetId.mockResolvedValue([domainItem])

    const toResponseSpy = jest.spyOn(BudgetItemMapper, 'toResponseDto')

    const result = await useCase.execute(budgetId)

    expect(mockBudgetItemRepository.findByBudgetId).toHaveBeenCalledWith(budgetId)
    expect(toResponseSpy).toHaveBeenCalledWith(domainItem)
    expect(result).toBeInstanceOf(Success)
    if (result instanceof Success) {
      expect(result.value).toEqual([
        {
          id: domainItem.id,
          type: domainItem.type,
          description: domainItem.description,
          quantity: domainItem.quantity,
          unitPrice: domainItem.getFormattedUnitPrice(),
          totalPrice: domainItem.getFormattedTotalPrice(),
          budgetId: domainItem.budgetId,
          notes: domainItem.notes,
          stockItemId: domainItem.stockItemId,
          serviceId: domainItem.serviceId,
          createdAt: domainItem.createdAt,
          updatedAt: domainItem.updatedAt,
        },
      ])
    }
  })

  it('returns Success with empty array when no items found', async () => {
    const budgetId = 'budget-empty'
    mockUserContextService.getUserId.mockReturnValue('me')
    mockBudgetItemRepository.findByBudgetId.mockResolvedValue([])

    const result = await useCase.execute(budgetId)

    expect(mockBudgetItemRepository.findByBudgetId).toHaveBeenCalledWith(budgetId)
    expect(result).toBeInstanceOf(Success)
    if (result instanceof Success) expect(result.value).toEqual([])
  })

  it('returns Failure when repository throws', async () => {
    const budgetId = 'budget-error'
    const err = new Error('db down')
    mockUserContextService.getUserId.mockReturnValue('me')
    mockBudgetItemRepository.findByBudgetId.mockRejectedValue(err)

    const errorSpy = jest.spyOn(Logger.prototype, 'error')

    const result = await useCase.execute(budgetId)

    expect(mockBudgetItemRepository.findByBudgetId).toHaveBeenCalledWith(budgetId)
    expect(errorSpy).toHaveBeenCalled()
    expect(result).toBeInstanceOf(Failure)
    if (result instanceof Failure) {
      expect(result.error.message).toMatch(/Failed to get budget items|db down/)
    }
  })
})

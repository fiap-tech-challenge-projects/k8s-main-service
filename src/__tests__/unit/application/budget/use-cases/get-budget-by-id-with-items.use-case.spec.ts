import { Logger } from '@nestjs/common'

import { BudgetMapper } from '@application/budget/mappers'
import { GetBudgetByIdWithItemsUseCase } from '@application/budget/use-cases'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { InvalidValueException } from '@shared/exceptions'

describe('GetBudgetByIdWithItemsUseCase', () => {
  let useCase: GetBudgetByIdWithItemsUseCase
  let repository: any

  beforeEach(() => {
    repository = { findByIdWithItems: jest.fn() }
    const mockUserContext = { getUserId: () => 'user-1' }

    useCase = new GetBudgetByIdWithItemsUseCase(repository as any, mockUserContext as any)

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns success when budget with items found', async () => {
    const id = 'b1'
    const budgetWithItems = { budget: { id }, budgetItems: [] }

    repository.findByIdWithItems.mockResolvedValue(budgetWithItems)

    // BudgetMapper expects a Budget entity; our repository returns plain objects in the test,
    // so stub the mapper to return the DTO we want without accessing entity methods.
    jest.spyOn(BudgetMapper, 'toResponseDtoWithItems').mockReturnValue(budgetWithItems as any)

    const result = await useCase.execute(id)

    expect(repository.findByIdWithItems).toHaveBeenCalledWith(id)
    expect(result.isSuccess).toBe(true)

    if (result.isSuccess) {
      expect(result.value).toEqual(budgetWithItems)
    }
  })

  it('returns failure when not found and logs a warning', async () => {
    const id = 'not-found'

    repository.findByIdWithItems.mockResolvedValue(null)

    const warnSpy = jest.spyOn(Logger.prototype, 'warn')

    const result = await useCase.execute(id)

    expect(result.isFailure).toBe(true)
    expect(warnSpy).toHaveBeenCalled()
    if (result.isFailure) expect(result.error).toBeInstanceOf(BudgetNotFoundException)
  })

  it('returns BudgetNotFoundException when repository throws non-domain error', async () => {
    const id = 'err'
    repository.findByIdWithItems.mockRejectedValue(new Error('db fail'))

    const result = await useCase.execute(id)

    expect(result.isFailure).toBe(true)
    if (result.isFailure) expect(result.error).toBeInstanceOf(BudgetNotFoundException)
  })

  it('preserves DomainException thrown by repository and logs error', async () => {
    const id = 'domain-err'
    const domainErr = new InvalidValueException('x', 'boom')
    repository.findByIdWithItems.mockRejectedValue(domainErr)

    const errSpy = jest.spyOn(Logger.prototype, 'error')

    const result = await useCase.execute(id)

    expect(result.isFailure).toBe(true)
    if (result.isFailure) expect(result.error).toBe(domainErr)
    expect(errSpy).toHaveBeenCalled()
  })
})

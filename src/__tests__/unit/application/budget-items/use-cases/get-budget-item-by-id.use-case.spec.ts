/* eslint-disable import/no-internal-modules */
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { GetBudgetItemByIdUseCase } from '@application/budget-items/use-cases'
import { BudgetItemNotFoundException } from '@domain/budget-items/exceptions'

import { setupLoggerMock, clearLoggerMocks } from '../../../test-utils/mock-logger'

describe('GetBudgetItemByIdUseCase', () => {
  const repo: any = { findById: jest.fn() }
  const userContext: any = {
    getUserId: jest.fn().mockReturnValue('u-1'),
    getUserRole: jest.fn().mockReturnValue('EMPLOYEE'),
  }

  beforeEach(() => jest.clearAllMocks())

  beforeAll(() => setupLoggerMock())
  afterAll(() => clearLoggerMocks())

  it('returns Success when budget item exists', async () => {
    const item = { id: 'bi-1' }
    jest.spyOn(BudgetItemMapper, 'toResponseDto').mockReturnValue({ id: 'bi-1' } as any)
    repo.findById.mockResolvedValue(item)

    const useCase = new GetBudgetItemByIdUseCase(repo as any, userContext as any)
    const res = await useCase.execute('bi-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('bi-1')
  })

  it('returns Failure when not found', async () => {
    repo.findById.mockResolvedValue(null)

    const useCase = new GetBudgetItemByIdUseCase(repo as any, userContext as any)
    const res = await useCase.execute('x')

    expect(res.isFailure).toBe(true)
    if (res.isFailure) expect(res.error).toBeInstanceOf(BudgetItemNotFoundException)
  })

  it('returns Failure when repository throws', async () => {
    repo.findById.mockRejectedValue(new Error('db'))

    const useCase = new GetBudgetItemByIdUseCase(repo as any, userContext as any)
    const res = await useCase.execute('bi-1')

    expect(res.isFailure).toBe(true)
  })
})

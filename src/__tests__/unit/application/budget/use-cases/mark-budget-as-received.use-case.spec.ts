/* eslint-disable import/no-internal-modules */
import { BudgetMapper } from '@application/budget/mappers'
import { MarkBudgetAsReceivedUseCase } from '@application/budget/use-cases'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { BudgetStatusChangeValidator } from '@domain/budget/validators'

import { setupLoggerMock, clearLoggerMocks } from '../../../test-utils/mock-logger'

describe('MarkBudgetAsReceivedUseCase', () => {
  let mockRepo: any
  let mockUserContext: any
  let useCase: MarkBudgetAsReceivedUseCase

  const existingBudget: any = {
    id: 'budget-1',
    status: 'SENT',
    markAsReceived: jest.fn().mockImplementation(function () {
      this.status = 'RECEIVED'
    }),
  }

  beforeEach(() => {
    // install per-test logger mock to ensure no real Nest logs are emitted
    setupLoggerMock()
    mockRepo = { findById: jest.fn(), update: jest.fn() }
    mockUserContext = { getUserId: jest.fn().mockReturnValue('user-1') }

    jest.spyOn(BudgetMapper, 'toResponseDto').mockImplementation((b: any) => ({ id: b.id }) as any)
    useCase = new MarkBudgetAsReceivedUseCase(mockRepo, mockUserContext)
  })

  afterEach(() => {
    // restore spied implementations (validator spies) and clear mock history
    jest.restoreAllMocks()
    jest.clearAllMocks()
    // clear logger mock call history but keep spies installed by global setup if any
    clearLoggerMocks()
  })

  it('returns Failure when budget not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const result = await useCase.execute('missing')

    expect(result.isFailure).toBeTruthy()
    if (result.isFailure) expect(result.error).toBeInstanceOf(BudgetNotFoundException)
  })

  it('returns Failure when validator throws', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    jest.spyOn(BudgetStatusChangeValidator, 'validateCanMarkAsReceived').mockImplementation(() => {
      throw new Error('invalid status')
    })

    const result = await useCase.execute('budget-1')

    expect(result.isFailure).toBeTruthy()
  })

  it('returns Failure when repository update throws', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    mockRepo.update.mockRejectedValue(new Error('db error'))

    const result = await useCase.execute('budget-1')

    expect(result.isFailure).toBeTruthy()
  })

  it('returns Success when marking as received succeeds', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    mockRepo.update.mockResolvedValue({ id: 'budget-1', status: 'RECEIVED' })

    const result = await useCase.execute('budget-1')

    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) expect(result.value.id).toBe('budget-1')
    expect(mockRepo.update).toHaveBeenCalled()
  })
})

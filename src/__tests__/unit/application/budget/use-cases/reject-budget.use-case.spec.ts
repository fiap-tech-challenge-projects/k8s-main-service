/* eslint-disable import/no-internal-modules */
import { BudgetMapper } from '@application/budget/mappers'
import { RejectBudgetUseCase } from '@application/budget/use-cases'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { BudgetStatusChangeValidator } from '@domain/budget/validators'

import { setupLoggerMock, clearLoggerMocks } from '../../../test-utils/mock-logger'

describe('RejectBudgetUseCase', () => {
  let mockRepo: any
  let mockUserContext: any
  let mockEmitter: any
  let useCase: RejectBudgetUseCase

  const existingBudget: any = {
    id: 'b-1',
    status: 'SENT',
    isExpired: jest.fn().mockReturnValue(false),
    getExpirationDate: jest.fn().mockReturnValue(null),
    reject: jest.fn().mockImplementation(function () {
      this.status = 'REJECTED'
    }),
  }

  beforeEach(() => {
    setupLoggerMock()
    mockRepo = { findById: jest.fn(), update: jest.fn() }
    mockUserContext = { getUserId: jest.fn().mockReturnValue('u-1') }
    mockEmitter = { emitBudgetRejectedEvent: jest.fn() }

    jest.spyOn(BudgetMapper, 'toResponseDto').mockImplementation((b: any) => ({ id: b.id }) as any)
    useCase = new RejectBudgetUseCase(mockRepo, mockEmitter, mockUserContext)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
    clearLoggerMocks()
  })

  it('returns Failure when budget not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const result = await useCase.execute('missing', 'nope')

    expect(result.isFailure).toBeTruthy()
    if (result.isFailure) expect(result.error).toBeInstanceOf(BudgetNotFoundException)
  })

  it('returns Failure when validator throws', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    jest.spyOn(BudgetStatusChangeValidator, 'validateRejection').mockImplementation(() => {
      throw new Error('invalid')
    })

    const result = await useCase.execute('b-1', 'reason')

    expect(result.isFailure).toBeTruthy()
  })

  it('returns Failure when repo update throws', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    mockRepo.update.mockRejectedValue(new Error('db'))

    const result = await useCase.execute('b-1', 'reason')

    expect(result.isFailure).toBeTruthy()
  })

  it('returns Success when rejection succeeds', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    mockRepo.update.mockResolvedValue({ id: 'b-1', status: 'REJECTED' })

    const result = await useCase.execute('b-1', 'reason')

    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) expect(result.value.id).toBe('b-1')
    expect(mockEmitter.emitBudgetRejectedEvent).toHaveBeenCalled()
  })
})

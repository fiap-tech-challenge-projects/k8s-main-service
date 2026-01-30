/* eslint-disable import/no-internal-modules */
import { BudgetMapper } from '@application/budget/mappers'
import { SendBudgetUseCase } from '@application/budget/use-cases'
import { BudgetNotFoundException } from '@domain/budget/exceptions'
import { BudgetStatusChangeValidator } from '@domain/budget/validators'

import { setupLoggerMock, clearLoggerMocks } from '../../../test-utils/mock-logger'

describe('SendBudgetUseCase', () => {
  let mockRepo: any
  let mockUserContext: any
  let mockEmitter: any
  let useCase: SendBudgetUseCase

  const existingBudget: any = {
    id: 'b-1',
    status: 'DRAFT',
    send: jest.fn().mockImplementation(function () {
      this.status = 'SENT'
    }),
  }

  beforeEach(() => {
    setupLoggerMock()
    mockRepo = { findById: jest.fn(), update: jest.fn() }
    mockUserContext = { getUserId: jest.fn().mockReturnValue('u-1') }
    mockEmitter = { emitBudgetSentEvent: jest.fn() }

    jest.spyOn(BudgetMapper, 'toResponseDto').mockImplementation((b: any) => ({ id: b.id }) as any)
    useCase = new SendBudgetUseCase(mockRepo, mockEmitter, mockUserContext)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
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
    jest.spyOn(BudgetStatusChangeValidator, 'validateCanSend').mockImplementation(() => {
      throw new Error('invalid')
    })

    const result = await useCase.execute('b-1')

    expect(result.isFailure).toBeTruthy()
  })

  it('returns Failure when repo update throws', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    mockRepo.update.mockRejectedValue(new Error('db'))

    const result = await useCase.execute('b-1')

    expect(result.isFailure).toBeTruthy()
  })

  it('returns Success when send succeeds', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    mockRepo.update.mockResolvedValue({ id: 'b-1', status: 'SENT' })

    // ensure validator doesn't throw in success path
    jest.spyOn(BudgetStatusChangeValidator, 'validateCanSend').mockImplementation(() => undefined)

    const result = await useCase.execute('b-1')

    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) expect(result.value.id).toBe('b-1')
    expect(mockEmitter.emitBudgetSentEvent).toHaveBeenCalled()
  })
})

/* eslint-disable import/no-internal-modules */
import { BudgetMapper } from '@application/budget/mappers'
import { UpdateBudgetUseCase } from '@application/budget/use-cases'
import { BudgetNotFoundException } from '@domain/budget/exceptions'

import { setupLoggerMock, clearLoggerMocks } from '../../../test-utils/mock-logger'

describe('UpdateBudgetUseCase', () => {
  let mockRepo: any
  let mockUserContext: any
  let useCase: UpdateBudgetUseCase

  const existingBudget: any = { id: 'b-1', title: 'old', status: 'DRAFT' }

  beforeEach(() => {
    setupLoggerMock()
    mockRepo = { findById: jest.fn(), update: jest.fn() }
    mockUserContext = { getUserId: jest.fn().mockReturnValue('u-1') }

    // default mapper behaviour for tests
    jest
      .spyOn(BudgetMapper, 'fromUpdateDto')
      .mockImplementation((dto: any, b: any) => Object.assign(b, dto))
    jest.spyOn(BudgetMapper, 'toResponseDto').mockImplementation((b: any) => ({ id: b.id }) as any)

    useCase = new UpdateBudgetUseCase(mockRepo, mockUserContext)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
    clearLoggerMocks()
  })

  it('returns Failure when budget not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const result = await useCase.execute('missing', { title: 'x' } as any)

    expect(result.isFailure).toBeTruthy()
    if (result.isFailure) expect(result.error).toBeInstanceOf(BudgetNotFoundException)
  })

  it('returns Failure when mapper throws', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    jest.spyOn(BudgetMapper, 'fromUpdateDto').mockImplementation(() => {
      throw new Error('mapper bad')
    })

    const result = await useCase.execute('b-1', { title: 'x' } as any)

    expect(result.isFailure).toBeTruthy()
  })

  it('returns Failure when repo update throws', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    mockRepo.update.mockRejectedValue(new Error('db'))

    const result = await useCase.execute('b-1', { title: 'x' } as any)

    expect(result.isFailure).toBeTruthy()
  })

  it('returns Failure when repo.update throws DomainException', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    // simulate DomainException subclass
    mockRepo.update.mockRejectedValue(new (class extends Error {})('domain-ex'))

    const result = await useCase.execute('b-1', { title: 'x' } as any)

    expect(result.isFailure).toBeTruthy()
  })

  it('returns Success when update succeeds', async () => {
    mockRepo.findById.mockResolvedValue({ ...existingBudget })
    mockRepo.update.mockResolvedValue({ id: 'b-1', title: 'x', status: 'DRAFT' })

    const result = await useCase.execute('b-1', { title: 'x' } as any)

    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) expect(result.value.id).toBe('b-1')
  })
})

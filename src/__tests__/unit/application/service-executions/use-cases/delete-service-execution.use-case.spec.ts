import { DeleteServiceExecutionUseCase } from '@application/service-executions/use-cases'
import { ServiceExecutionNotFoundException } from '@domain/service-executions/exceptions'

describe('DeleteServiceExecutionUseCase', () => {
  let mockRepo: any
  let useCase: DeleteServiceExecutionUseCase

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), delete: jest.fn() }
    useCase = new DeleteServiceExecutionUseCase(mockRepo)
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns Success when found and deleted', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'se-1' })

    const res = await useCase.execute('se-1')

    expect(res.isSuccess).toBeTruthy()
  })

  it('returns Failure when not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const res = await useCase.execute('x')

    expect(res.isFailure).toBeTruthy()
    if (res.isFailure) expect(res.error).toBeInstanceOf(ServiceExecutionNotFoundException)
  })

  it('returns Failure on repository error', async () => {
    mockRepo.findById.mockRejectedValue(new Error('boom'))

    const res = await useCase.execute('y')

    expect(res.isFailure).toBeTruthy()
  })
})

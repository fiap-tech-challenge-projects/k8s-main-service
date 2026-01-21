import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { GetServiceExecutionByIdUseCase } from '@application/service-executions/use-cases'
import { ServiceExecutionNotFoundException } from '@domain/service-executions/exceptions'

describe('GetServiceExecutionByIdUseCase (unit)', () => {
  let mockRepo: any
  let useCase: GetServiceExecutionByIdUseCase

  const existing: any = { id: 'se-1', status: 'STARTED' }

  beforeEach(() => {
    mockRepo = { findById: jest.fn() }
    jest
      .spyOn(ServiceExecutionMapper, 'toResponseDto')
      .mockImplementation((s: any) => ({ id: s.id }) as any)
    useCase = new GetServiceExecutionByIdUseCase(mockRepo as any)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Failure when not found', async () => {
    mockRepo.findById.mockResolvedValue(null)
    const res = await useCase.execute('missing')
    expect(res.isFailure).toBeTruthy()
    expect((res as any).error).toBeInstanceOf(ServiceExecutionNotFoundException)
  })

  it('throws when repo throws', async () => {
    mockRepo.findById.mockRejectedValue(new Error('db'))
    await expect(useCase.execute('se-1')).rejects.toThrow('db')
  })

  it('returns Success when found', async () => {
    mockRepo.findById.mockResolvedValue(existing)
    const res = await useCase.execute('se-1')
    expect(res.isSuccess).toBeTruthy()
    expect((res as any).value.id).toBe('se-1')
  })
})

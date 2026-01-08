import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { GetServiceExecutionByIdUseCase } from '@application/service-executions/use-cases'

describe('GetServiceExecutionByIdUseCase', () => {
  const mockRepo = { findById: jest.fn() }
  const useCase = new GetServiceExecutionByIdUseCase(mockRepo as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns success when found', async () => {
    const dto = { id: 'se-1', status: 'OPEN' }
    mockRepo.findById.mockResolvedValue({ id: 'se-1' })
    jest.spyOn(ServiceExecutionMapper, 'toResponseDto').mockReturnValue(dto as any)

    const res = await useCase.execute('se-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toEqual(dto)
  })

  it('returns failure when not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const res = await useCase.execute('missing')

    expect(res.isFailure).toBe(true)
  })
})

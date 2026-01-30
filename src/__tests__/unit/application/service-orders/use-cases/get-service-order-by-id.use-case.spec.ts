// DUPLICATE FROM: src/__tests__/unit/application/service-orders/get-service-order-by-id.use-case.spec.ts
import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { GetServiceOrderByIdUseCase } from '@application/service-orders/use-cases'
import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'

describe('GetServiceOrderByIdUseCase (unit)', () => {
  let mockRepo: any
  let useCase: GetServiceOrderByIdUseCase

  const existing: any = { id: 'so-1', status: 'RECEIVED', vehicleId: 'v1' }

  beforeEach(() => {
    mockRepo = { findById: jest.fn() }

    jest
      .spyOn(ServiceOrderMapper, 'toResponseDto')
      .mockImplementation((s: any) => ({ id: s.id }) as any)

    useCase = new GetServiceOrderByIdUseCase(mockRepo as any)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Failure when not found', async () => {
    mockRepo.findById.mockResolvedValue(null)
    const result = await useCase.execute('missing')
    expect(result.isFailure).toBeTruthy()
    expect((result as any).error).toBeInstanceOf(ServiceOrderNotFoundException)
  })

  it('returns Failure when repository throws', async () => {
    mockRepo.findById.mockRejectedValue(new Error('db'))
    const result = await useCase.execute('so-1')
    expect(result.isFailure).toBeTruthy()
  })

  it('returns Success when found', async () => {
    mockRepo.findById.mockResolvedValue(existing)
    const result = await useCase.execute('so-1')
    expect(result.isSuccess).toBeTruthy()
    expect((result as any).value).toEqual({ id: 'so-1' })
  })
})

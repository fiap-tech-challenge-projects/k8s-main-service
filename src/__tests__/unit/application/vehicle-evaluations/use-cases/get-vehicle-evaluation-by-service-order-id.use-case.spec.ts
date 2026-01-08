import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import { GetVehicleEvaluationByServiceOrderIdUseCase } from '@application/vehicle-evaluations/use-cases'

describe('GetVehicleEvaluationByServiceOrderIdUseCase', () => {
  const mockRepo = { findByServiceOrderId: jest.fn() }
  const useCase = new GetVehicleEvaluationByServiceOrderIdUseCase(mockRepo as any)

  beforeEach(() => jest.clearAllMocks())

  it('returns success when evaluation found', async () => {
    const dto = { id: 've-1', serviceOrderId: 'so-1' }
    mockRepo.findByServiceOrderId.mockResolvedValue({ id: 've-1', serviceOrderId: 'so-1' })
    jest.spyOn(VehicleEvaluationMapper, 'toResponseDto').mockReturnValue(dto as any)

    const res = await useCase.execute('so-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toEqual(dto)
  })

  it('returns failure when not found', async () => {
    mockRepo.findByServiceOrderId.mockResolvedValue(null)

    const res = await useCase.execute('so-2')

    expect(res.isFailure).toBe(true)
  })

  it('returns failure when repository throws', async () => {
    mockRepo.findByServiceOrderId.mockRejectedValue(new Error('boom'))

    const res = await useCase.execute('so-3')
    expect(res.isFailure).toBe(true)
  })
})

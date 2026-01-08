import { GetAllVehicleEvaluationsUseCase } from '@application/vehicle-evaluations'
import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'

describe('GetAllVehicleEvaluationsUseCase', () => {
  it('returns Success with mapped dtos when repository returns paginated data', async () => {
    const mockPaginated = { data: [{ id: 've-1' }], meta: { total: 1, page: 1, limit: 10 } }
    const mockRepo = { findAll: jest.fn().mockResolvedValue(mockPaginated) }

    jest
      .spyOn(VehicleEvaluationMapper, 'toResponseDtoArray')
      .mockReturnValue([{ id: 've-1' }] as any)

    const useCase = new GetAllVehicleEvaluationsUseCase(mockRepo as any)
    const res = await useCase.execute()

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.data).toHaveLength(1)
  })

  it('returns Failure when repository throws', async () => {
    const mockRepo = { findAll: jest.fn().mockRejectedValue(new Error('db')) }
    const useCase = new GetAllVehicleEvaluationsUseCase(mockRepo as any)

    const res = await useCase.execute()

    expect(res.isFailure).toBe(true)
  })
})

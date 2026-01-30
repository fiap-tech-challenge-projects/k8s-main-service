import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import { GetVehicleEvaluationsByVehicleIdUseCase } from '@application/vehicle-evaluations/use-cases'

describe('GetVehicleEvaluationsByVehicleIdUseCase (unit)', () => {
  let mockRepo: any
  let useCase: GetVehicleEvaluationsByVehicleIdUseCase

  beforeEach(() => {
    mockRepo = { findByVehicleId: jest.fn() }
    jest
      .spyOn(VehicleEvaluationMapper, 'toResponseDto')
      .mockImplementation((v: any) => ({ id: v.id }) as any)
    useCase = new GetVehicleEvaluationsByVehicleIdUseCase(mockRepo)
  })

  afterEach(() => jest.clearAllMocks())

  it('returns Success with mapped list', async () => {
    mockRepo.findByVehicleId.mockResolvedValue([{ id: 'ev-1' }])
    const result = await useCase.execute('veh-1')
    expect(result.isSuccess).toBeTruthy()
    expect((result as any).value).toHaveLength(1)
  })

  it('returns Failure on repo error', async () => {
    const err = new Error('db')
    mockRepo.findByVehicleId.mockRejectedValue(err)
    const result = await useCase.execute('veh-1')
    expect(result.isFailure).toBeTruthy()
  })
})

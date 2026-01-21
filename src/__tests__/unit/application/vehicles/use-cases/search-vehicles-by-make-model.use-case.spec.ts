import { VehicleMapper } from '@application/vehicles/mappers'
import { SearchVehiclesByMakeModelUseCase } from '@application/vehicles/use-cases'

describe('SearchVehiclesByMakeModelUseCase', () => {
  let mockRepo: any
  let useCase: SearchVehiclesByMakeModelUseCase

  beforeEach(() => {
    mockRepo = { findByMakeAndModel: jest.fn() }
    jest.spyOn(VehicleMapper, 'toResponseDto').mockImplementation((v: any) => ({ id: v.id }) as any)
    useCase = new SearchVehiclesByMakeModelUseCase(mockRepo)
  })

  afterEach(() => jest.restoreAllMocks())

  it('returns Success when repository returns vehicles', async () => {
    mockRepo.findByMakeAndModel.mockResolvedValue({
      data: [{ id: 'v-2' }],
      meta: { page: 1, total: 1, totalPages: 1 },
    })

    const result = await useCase.execute('Toyota', 'Corolla', undefined, 1, 10)

    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) expect(result.value.data).toEqual([{ id: 'v-2' }])
  })

  it('returns Failure when repository throws', async () => {
    mockRepo.findByMakeAndModel.mockRejectedValue(new Error('db'))

    const result = await useCase.execute('Toyota', 'Corolla')

    expect(result.isFailure).toBeTruthy()
  })
})

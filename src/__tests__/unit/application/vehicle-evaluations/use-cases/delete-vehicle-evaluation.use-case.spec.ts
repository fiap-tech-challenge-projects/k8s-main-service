import { DeleteVehicleEvaluationUseCase } from '@application/vehicle-evaluations'

describe('DeleteVehicleEvaluationUseCase', () => {
  it('returns Success when deletion occurs', async () => {
    const mockRepo = {
      findById: jest.fn().mockResolvedValue({ id: 'v-1' }),
      delete: jest.fn().mockResolvedValue(true),
    }
    const useCase = new DeleteVehicleEvaluationUseCase(mockRepo as any)

    const res = await useCase.execute('v-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value).toBe(true)
  })

  it('returns Failure when entity not found', async () => {
    const mockRepo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new DeleteVehicleEvaluationUseCase(mockRepo as any)

    const res = await useCase.execute('v-1')

    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repository throws', async () => {
    const err = new Error('db')
    const mockRepo = { findById: jest.fn().mockRejectedValue(err) }
    const useCase = new DeleteVehicleEvaluationUseCase(mockRepo as any)

    const res = await useCase.execute('v-1')

    expect(res.isFailure).toBe(true)
  })
})

import { GetVehicleEvaluationByIdUseCase } from '@application/vehicle-evaluations/use-cases'

describe('GetVehicleEvaluationByIdUseCase', () => {
  it('returns Success when evaluation found', async () => {
    const evalEntity = { id: 've-1' }
    const repo = { findById: jest.fn().mockResolvedValue(evalEntity) }

    const useCase = new GetVehicleEvaluationByIdUseCase(repo as any)
    const res = await useCase.execute('ve-1')

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('ve-1')
  })

  it('returns Failure when not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new GetVehicleEvaluationByIdUseCase(repo as any)

    const res = await useCase.execute('ve-x')
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repository throws', async () => {
    const repo = { findById: jest.fn().mockRejectedValue(new Error('boom')) }
    const useCase = new GetVehicleEvaluationByIdUseCase(repo as any)

    const res = await useCase.execute('ve-x')
    expect(res.isFailure).toBe(true)
  })
})

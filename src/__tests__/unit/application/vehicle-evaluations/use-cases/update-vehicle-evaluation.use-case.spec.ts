import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import { UpdateVehicleEvaluationUseCase } from '@application/vehicle-evaluations/use-cases'

describe('UpdateVehicleEvaluationUseCase', () => {
  it('returns Success when exists and updated', async () => {
    const ve = { id: 've-1', update: jest.fn() }
    const repo = {
      findById: jest.fn().mockResolvedValue(ve),
      update: jest.fn().mockResolvedValue({ id: 've-1' }),
    }

    jest.spyOn(VehicleEvaluationMapper, 'toResponseDto').mockReturnValue({ id: 've-1' } as any)

    const useCase = new UpdateVehicleEvaluationUseCase(repo as any)
    const res = await useCase.execute('ve-1', { notes: 'x' } as any)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('ve-1')
  })

  it('returns Failure when not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new UpdateVehicleEvaluationUseCase(repo as any)

    const res = await useCase.execute('ve-1', { notes: 'x' } as any)
    expect(res.isFailure).toBe(true)
  })
})

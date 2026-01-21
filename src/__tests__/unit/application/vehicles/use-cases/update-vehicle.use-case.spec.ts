import { VehicleMapper } from '@application/vehicles/mappers'
import { UpdateVehicleUseCase } from '@application/vehicles/use-cases'

describe('UpdateVehicleUseCase', () => {
  it('returns Success when vehicle updated', async () => {
    const vehicle = { id: 'v-1', update: jest.fn() }
    const repo = {
      findById: jest.fn().mockResolvedValue(vehicle),
      update: jest.fn().mockResolvedValue({ id: 'v-1' }),
    }

    jest
      .spyOn(VehicleMapper, 'toResponseDto')
      .mockReturnValue({ id: 'v-1', licensePlate: 'ABC1234' } as any)

    jest
      .spyOn(VehicleMapper, 'fromUpdateDto')
      .mockImplementation((dto: any, existing: any) => ({ ...existing, ...dto }))

    const useCase = new UpdateVehicleUseCase(repo as any)
    const res = await useCase.execute('v-1', { color: 'red' } as any)

    expect(res.isSuccess).toBe(true)
    if (res.isSuccess) expect(res.value.id).toBe('v-1')
    expect(repo.findById).toHaveBeenCalledWith('v-1')
  })

  it('returns Failure when vehicle not found', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) }
    const useCase = new UpdateVehicleUseCase(repo as any)

    const res = await useCase.execute('v-x', { color: 'blue' } as any)
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repository throws during find', async () => {
    const repo = { findById: jest.fn().mockRejectedValue(new Error('boom')) }
    const useCase = new UpdateVehicleUseCase(repo as any)

    const res = await useCase.execute('v-1', { color: 'blue' } as any)
    expect(res.isFailure).toBe(true)
  })

  it('returns Failure when repository throws during update', async () => {
    const vehicle = { id: 'v-1', update: jest.fn() }
    const repo: any = {
      findById: jest.fn().mockResolvedValue(vehicle),
      update: jest.fn().mockRejectedValue(new Error('update-fail')),
    }

    const useCase = new UpdateVehicleUseCase(repo as any)
    const res = await useCase.execute('v-1', { color: 'green' } as any)
    expect(res.isFailure).toBe(true)
  })
})

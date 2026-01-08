import { VehicleEvaluationMapper } from '@application/vehicle-evaluations/mappers'
import { VehicleEvaluation } from '@domain/vehicle-evaluations'

describe('VehicleEvaluationMapper', () => {
  it('maps to response dto and array (class instance)', () => {
    const entity = new VehicleEvaluation('id1', 'so1', 'v1', { ok: true }, new Date(), 'notes')
    const dto = VehicleEvaluationMapper.toResponseDto(entity as any)
    expect(dto.id).toBe('id1')
    const arr = VehicleEvaluationMapper.toResponseDtoArray([entity as any])
    expect(Array.isArray(arr)).toBe(true)
    expect(arr[0].id).toBe('id1')
  })

  it('maps plain object to response dto and updates existing entity', () => {
    const entity: any = {
      id: 've1',
      details: { score: 90 },
      evaluationDate: new Date('2025-01-01T00:00:00.000Z'),
      mechanicNotes: 'ok',
      serviceOrderId: 'so1',
      vehicleId: 'v1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const dto = VehicleEvaluationMapper.toResponseDto(entity)
    expect(dto.id).toBe(entity.id)
    expect(dto.details).toBe(entity.details)

    const arr = VehicleEvaluationMapper.toResponseDtoArray([entity])
    expect(arr[0]).toEqual(dto)

    const entity2 = new VehicleEvaluation('id2', 'so2', 'v2', { ok: false }, new Date(), 'notes')
    const updated = VehicleEvaluationMapper.fromUpdateDto(
      { mechanicNotes: 'new' } as any,
      entity2 as any,
    )
    expect(updated).toBe(entity2)
  })
})

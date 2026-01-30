import { VehicleEvaluation } from '@domain/vehicle-evaluations/entities'
import { VehicleEvaluationMapper } from '@infra/database/prisma/mappers'

describe('VehicleEvaluationMapper', () => {
  describe('toDomain', () => {
    it('maps full prisma model to domain entity', () => {
      const prisma = {
        id: 've-1',
        serviceOrderId: 'so-1',
        vehicleId: 'v-1',
        details: { oilLevel: 'low' },
        evaluationDate: new Date('2024-04-01T00:00:00.000Z'),
        mechanicNotes: 'check belt',
        createdAt: new Date('2024-04-01T00:00:00.000Z'),
      }

      const domain = VehicleEvaluationMapper.toDomain(prisma as any)

      expect(domain.id).toBe('ve-1')
      expect(domain.serviceOrderId).toBe('so-1')
      expect(domain.vehicleId).toBe('v-1')
      expect(domain.details).toEqual({ oilLevel: 'low' })
      expect(domain.mechanicNotes).toBe('check belt')
    })

    it('throws when prisma model is null', () => {
      expect(() => VehicleEvaluationMapper.toDomain(null as any)).toThrow(
        'Prisma VehicleEvaluation model cannot be null or undefined',
      )
    })
  })

  describe('toDomainMany', () => {
    it('maps array and filters nulls', () => {
      const list = [
        {
          id: 'one',
          serviceOrderId: 'so',
          vehicleId: 'v',
          details: {},
          evaluationDate: new Date(),
          createdAt: new Date(),
        },
        null,
      ]

      const res = VehicleEvaluationMapper.toDomainMany(list as any)
      expect(res).toHaveLength(1)
      expect(res[0].id).toBe('one')
    })

    it('returns [] when not array', () => {
      expect(VehicleEvaluationMapper.toDomainMany(null as any)).toEqual([])
    })
  })

  describe('toPrismaCreate and toPrismaUpdate', () => {
    it('converts domain to prisma create input with null mechanicNotes', () => {
      const domain = new VehicleEvaluation('id', 'so', 'v', { a: 1 }, new Date())

      const prisma = VehicleEvaluationMapper.toPrismaCreate(domain)
      expect(prisma.serviceOrderId).toBe(domain.serviceOrderId)
      expect(prisma.mechanicNotes).toBeNull()
    })

    it('throws when converting null domain', () => {
      expect(() => VehicleEvaluationMapper.toPrismaCreate(null as any)).toThrow(
        'VehicleEvaluation domain entity cannot be null or undefined',
      )
      expect(() => VehicleEvaluationMapper.toPrismaUpdate(null as any)).toThrow(
        'VehicleEvaluation domain entity cannot be null or undefined',
      )
    })
  })
})

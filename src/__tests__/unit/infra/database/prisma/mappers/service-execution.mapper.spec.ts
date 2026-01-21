import { ServiceExecution, ServiceExecutionStatus } from '@domain/service-executions/entities'
import { ServiceExecutionMapper } from '@infra/database/prisma/mappers'

describe('ServiceExecutionMapper', () => {
  describe('toDomain', () => {
    it('maps full prisma model to domain entity', () => {
      const prisma = {
        id: 'id-1',
        serviceOrderId: 'so-1',
        status: 'IN_PROGRESS',
        startTime: new Date('2024-01-01T10:00:00.000Z'),
        endTime: null,
        notes: 'note',
        mechanicId: 'mech-1',
        createdAt: new Date('2024-01-01T09:00:00.000Z'),
        updatedAt: new Date('2024-01-01T11:00:00.000Z'),
      }

      const domain = ServiceExecutionMapper.toDomain(prisma as any)

      expect(domain.id).toBe('id-1')
      expect(domain.status).toBe(ServiceExecutionStatus.IN_PROGRESS)
      expect(domain.startTime).toEqual(prisma.startTime)
      expect(domain.endTime).toBeUndefined()
      expect(domain.notes).toBe('note')
      expect(domain.mechanicId).toBe('mech-1')
    })

    it('throws when prisma model is null', () => {
      expect(() => ServiceExecutionMapper.toDomain(null as any)).toThrow(
        'Prisma ServiceExecution model cannot be null or undefined',
      )
    })
  })

  describe('toDomainMany', () => {
    it('maps array of prisma models', () => {
      const list = [
        {
          id: 'a',
          serviceOrderId: 'so-a',
          status: 'ASSIGNED',
          startTime: null,
          endTime: null,
          notes: null,
          mechanicId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        null,
        undefined,
      ]

      const res = ServiceExecutionMapper.toDomainMany(list as any)
      expect(res).toHaveLength(1)
      expect(res[0].id).toBe('a')
    })

    it('returns empty array when not given an array', () => {
      expect(ServiceExecutionMapper.toDomainMany(null as any)).toEqual([])
    })
  })

  describe('toPrismaCreate and toPrismaUpdate', () => {
    it('converts domain to prisma create input with nulls for missing optional', () => {
      const domain = new ServiceExecution(
        'id-test',
        'so-1',
        ServiceExecutionStatus.ASSIGNED,
        undefined,
        undefined,
        undefined,
        undefined,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-01T00:00:00.000Z'),
      )

      const prisma = ServiceExecutionMapper.toPrismaCreate(domain)

      expect(prisma.serviceOrderId).toBe(domain.serviceOrderId)
      expect(prisma.mechanicId).toBeNull()
      expect(prisma.startTime).toBeNull()
    })

    it('converts domain to prisma update input and sets updatedAt', () => {
      const domain = new ServiceExecution(
        'id-test',
        'so-1',
        ServiceExecutionStatus.ASSIGNED,
        undefined,
        undefined,
        'notes',
        'mech-1',
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-01T00:00:00.000Z'),
      )

      const prisma = ServiceExecutionMapper.toPrismaUpdate(domain)

      expect(prisma.serviceOrderId).toBe(domain.serviceOrderId)
      expect(prisma.updatedAt).toBeInstanceOf(Date)
    })

    it('throws when converting null domain', () => {
      expect(() => ServiceExecutionMapper.toPrismaCreate(null as any)).toThrow(
        'ServiceExecution domain entity cannot be null or undefined',
      )
      expect(() => ServiceExecutionMapper.toPrismaUpdate(null as any)).toThrow(
        'ServiceExecution domain entity cannot be null or undefined',
      )
    })
  })
})

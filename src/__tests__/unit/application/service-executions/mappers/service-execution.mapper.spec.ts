import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { ServiceExecution, ServiceExecutionStatus } from '@domain/service-executions/entities'

describe('ServiceExecutionMapper', () => {
  const baseEntity = new ServiceExecution(
    'se-1',
    'so-1',
    ServiceExecutionStatus.ASSIGNED,
    new Date('2024-01-01T10:00:00.000Z'),
    new Date('2024-01-01T12:00:00.000Z'),
    'Initial notes',
    'emp-1',
    new Date('2024-01-01T09:00:00.000Z'),
    new Date('2024-01-01T13:00:00.000Z'),
  )

  describe('toResponseDto', () => {
    it('should convert domain entity to response DTO', () => {
      const result = ServiceExecutionMapper.toResponseDto(baseEntity)
      expect(result).toEqual({
        id: 'se-1',
        status: ServiceExecutionStatus.ASSIGNED,
        startTime: new Date('2024-01-01T10:00:00.000Z'),
        endTime: new Date('2024-01-01T12:00:00.000Z'),
        notes: 'Initial notes',
        serviceOrderId: 'so-1',
        mechanicId: 'emp-1',
        durationInMinutes: 120,
        createdAt: new Date('2024-01-01T09:00:00.000Z'),
        updatedAt: new Date('2024-01-01T13:00:00.000Z'),
      })
    })

    it('should handle optional fields with undefined values', () => {
      const entity = new ServiceExecution(
        'se-2',
        'so-2',
        ServiceExecutionStatus.ASSIGNED,
        undefined,
        undefined,
        undefined,
        undefined,
        new Date('2024-01-01T09:00:00.000Z'),
        new Date('2024-01-01T13:00:00.000Z'),
      )
      const result = ServiceExecutionMapper.toResponseDto(entity)
      expect(result).toEqual({
        id: 'se-2',
        status: ServiceExecutionStatus.ASSIGNED,
        startTime: undefined,
        endTime: undefined,
        notes: undefined,
        serviceOrderId: 'so-2',
        mechanicId: undefined,
        durationInMinutes: undefined,
        createdAt: new Date('2024-01-01T09:00:00.000Z'),
        updatedAt: new Date('2024-01-01T13:00:00.000Z'),
      })
    })
  })

  describe('toResponseDtoArray', () => {
    it('should convert array of domain entities to response DTO array', () => {
      const entities = [
        baseEntity,
        new ServiceExecution(
          'se-2',
          'so-2',
          ServiceExecutionStatus.COMPLETED,
          new Date('2024-01-01T10:00:00.000Z'),
          new Date('2024-01-01T12:00:00.000Z'),
          'Done',
          'emp-2',
          new Date('2024-01-01T09:00:00.000Z'),
          new Date('2024-01-01T13:00:00.000Z'),
        ),
      ]
      const result = ServiceExecutionMapper.toResponseDtoArray(entities)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('se-1')
      expect(result[1].id).toBe('se-2')
      expect(result[1].status).toBe(ServiceExecutionStatus.COMPLETED)
    })

    it('should return empty array for empty input', () => {
      expect(ServiceExecutionMapper.toResponseDtoArray([])).toEqual([])
    })
  })

  describe('fromCreateDto', () => {
    it('should create domain entity from create DTO', () => {
      const createDto = {
        serviceOrderId: 'so-123',
        mechanicId: 'emp-123',
        notes: 'Test notes',
      }
      const result = ServiceExecutionMapper.fromCreateDto(createDto)
      expect(result).toBeInstanceOf(ServiceExecution)
      expect(result.serviceOrderId).toBe('so-123')
      expect(result.mechanicId).toBe('emp-123')
      expect(result.notes).toBe('Test notes')
      expect(result.status).toBe(ServiceExecutionStatus.ASSIGNED)
    })
  })

  describe('fromUpdateDto', () => {
    it('should update all fields if provided', () => {
      const entity = new ServiceExecution(
        'se-1',
        'so-1',
        ServiceExecutionStatus.ASSIGNED,
        new Date('2024-01-01T10:00:00.000Z'),
        new Date('2024-01-01T12:00:00.000Z'),
        'Old notes',
        'emp-1',
        new Date('2024-01-01T09:00:00.000Z'),
        new Date('2024-01-01T13:00:00.000Z'),
      )
      const updateDto = {
        mechanicId: 'emp-2',
        notes: 'New notes',
      }
      const updated = ServiceExecutionMapper.fromUpdateDto(entity, updateDto)
      expect(updated.mechanicId).toBe('emp-2')
      expect(updated.notes).toBe('New notes')
    })

    it('should update only mechanicId', () => {
      const entity = new ServiceExecution(
        'se-1',
        'so-1',
        ServiceExecutionStatus.ASSIGNED,
        new Date('2024-01-01T10:00:00.000Z'),
        new Date('2024-01-01T12:00:00.000Z'),
        'Old notes',
        'emp-1',
        new Date('2024-01-01T09:00:00.000Z'),
        new Date('2024-01-01T13:00:00.000Z'),
      )
      const updateDto = { mechanicId: 'emp-3' }
      const updated = ServiceExecutionMapper.fromUpdateDto(entity, updateDto)
      expect(updated.mechanicId).toBe('emp-3')
      expect(updated.notes).toBe('Old notes')
    })

    it('should update only notes', () => {
      const entity = new ServiceExecution(
        'se-1',
        'so-1',
        ServiceExecutionStatus.ASSIGNED,
        new Date('2024-01-01T10:00:00.000Z'),
        new Date('2024-01-01T12:00:00.000Z'),
        'Old notes',
        'emp-1',
        new Date('2024-01-01T09:00:00.000Z'),
        new Date('2024-01-01T13:00:00.000Z'),
      )
      const updateDto = { notes: 'Updated notes' }
      const updated = ServiceExecutionMapper.fromUpdateDto(entity, updateDto)
      expect(updated.mechanicId).toBe('emp-1')
      expect(updated.notes).toBe('Updated notes')
    })

    it('should not modify entity when no fields are provided', () => {
      const entity = new ServiceExecution(
        'se-1',
        'so-1',
        ServiceExecutionStatus.ASSIGNED,
        new Date('2024-01-01T10:00:00.000Z'),
        new Date('2024-01-01T12:00:00.000Z'),
        'Old notes',
        'emp-1',
        new Date('2024-01-01T09:00:00.000Z'),
        new Date('2024-01-01T13:00:00.000Z'),
      )
      const updateDto = {}
      const updated = ServiceExecutionMapper.fromUpdateDto(entity, updateDto)
      expect(updated.mechanicId).toBe('emp-1')
      expect(updated.notes).toBe('Old notes')
    })
  })
})

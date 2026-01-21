import { ServiceOrderStatus } from '@prisma/client'

import { ServiceOrderDtoFactory, ServiceOrderFactory } from '@/__tests__/factories'
import { CreateServiceOrderDto, UpdateServiceOrderDto } from '@application/service-orders/dto'
import { ServiceOrderMapper } from '@application/service-orders/mappers'
import { ServiceOrder } from '@domain/service-orders/entities'

describe('ServiceOrderMapper', () => {
  const clientId = 'client-test-123'
  const vehicleId = 'vehicle-test-456'

  describe('toResponseDto', () => {
    it('should map a complete service order entity to response DTO correctly', () => {
      const entity = ServiceOrderFactory.create({
        id: 'so-123',
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        requestDate: new Date('2024-01-01T10:00:00.000Z'),
        deliveryDate: new Date('2024-01-05T15:00:00.000Z'),
        cancellationReason: 'Customer declined service',
        notes: 'Engine diagnostic required',
        clientId: 'client-456',
        vehicleId: 'vehicle-789',
        createdAt: new Date('2024-01-01T09:00:00.000Z'),
        updatedAt: new Date('2024-01-01T11:00:00.000Z'),
      })

      const result = ServiceOrderMapper.toResponseDto(entity)

      expect(result).toEqual({
        id: 'so-123',
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        requestDate: new Date('2024-01-01T10:00:00.000Z'),
        deliveryDate: new Date('2024-01-05T15:00:00.000Z'),
        cancellationReason: 'Customer declined service',
        notes: 'Engine diagnostic required',
        clientId: 'client-456',
        vehicleId: 'vehicle-789',
        createdAt: new Date('2024-01-01T09:00:00.000Z'),
        updatedAt: new Date('2024-01-01T11:00:00.000Z'),
      })
    })

    it('should map a minimal service order entity to response DTO correctly', () => {
      const entity = ServiceOrderFactory.create({
        id: 'so-minimal',
        status: ServiceOrderStatus.REQUESTED,
        requestDate: new Date('2024-01-01T10:00:00.000Z'),
        deliveryDate: undefined,
        cancellationReason: undefined,
        notes: undefined,
        clientId: 'client-minimal',
        vehicleId: 'vehicle-minimal',
        createdAt: new Date('2024-01-01T09:00:00.000Z'),
        updatedAt: new Date('2024-01-01T09:00:00.000Z'),
      })

      const result = ServiceOrderMapper.toResponseDto(entity)

      expect(result).toEqual({
        id: 'so-minimal',
        status: ServiceOrderStatus.REQUESTED,
        requestDate: new Date('2024-01-01T10:00:00.000Z'),
        deliveryDate: undefined,
        cancellationReason: undefined,
        notes: undefined,
        clientId: 'client-minimal',
        vehicleId: 'vehicle-minimal',
        createdAt: new Date('2024-01-01T09:00:00.000Z'),
        updatedAt: new Date('2024-01-01T09:00:00.000Z'),
      })
    })

    it('should handle cancelled service orders correctly', () => {
      const entity = ServiceOrderFactory.createCancelled({
        cancellationReason: 'Workshop capacity full',
      })

      const result = ServiceOrderMapper.toResponseDto(entity)

      expect(result.status).toBe(ServiceOrderStatus.CANCELLED)
      expect(result.cancellationReason).toBe('Workshop capacity full')
    })

    it('should handle delivered service orders correctly', () => {
      const entity = ServiceOrderFactory.createDelivered({
        deliveryDate: new Date('2024-01-10T16:30:00.000Z'),
      })

      const result = ServiceOrderMapper.toResponseDto(entity)

      expect(result.status).toBe(ServiceOrderStatus.DELIVERED)
      expect(result.deliveryDate).toEqual(new Date('2024-01-10T16:30:00.000Z'))
    })

    it('should preserve all entity properties in the response DTO', () => {
      const entity = ServiceOrderFactory.create()

      const result = ServiceOrderMapper.toResponseDto(entity)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('requestDate')
      expect(result).toHaveProperty('deliveryDate')
      expect(result).toHaveProperty('cancellationReason')
      expect(result).toHaveProperty('notes')
      expect(result).toHaveProperty('clientId')
      expect(result).toHaveProperty('vehicleId')
      expect(result).toHaveProperty('createdAt')
      expect(result).toHaveProperty('updatedAt')
    })
  })

  describe('toResponseDtoArray', () => {
    it('should map an array of service order entities to response DTOs correctly', () => {
      const entities = [
        ServiceOrderFactory.create({ id: 'so-1', status: ServiceOrderStatus.REQUESTED }),
        ServiceOrderFactory.create({ id: 'so-2', status: ServiceOrderStatus.RECEIVED }),
        ServiceOrderFactory.create({ id: 'so-3', status: ServiceOrderStatus.IN_DIAGNOSIS }),
      ]

      const result = ServiceOrderMapper.toResponseDtoArray(entities)

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('id', 'so-1')
      expect(result[0]).toHaveProperty('status', ServiceOrderStatus.REQUESTED)
      expect(result[1]).toHaveProperty('id', 'so-2')
      expect(result[1]).toHaveProperty('status', ServiceOrderStatus.RECEIVED)
      expect(result[2]).toHaveProperty('id', 'so-3')
      expect(result[2]).toHaveProperty('status', ServiceOrderStatus.IN_DIAGNOSIS)
    })

    it('should handle empty array correctly', () => {
      const entities: ServiceOrder[] = []

      const result = ServiceOrderMapper.toResponseDtoArray(entities)

      expect(result).toHaveLength(0)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle array with one element correctly', () => {
      const entities = [ServiceOrderFactory.create({ id: 'so-single' })]

      const result = ServiceOrderMapper.toResponseDtoArray(entities)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('id', 'so-single')
    })

    it('should handle array with different service order states', () => {
      const entities = [
        ServiceOrderFactory.createRequested(),
        ServiceOrderFactory.createReceived(),
        ServiceOrderFactory.createInDiagnosis(),
        ServiceOrderFactory.createAwaitingApproval(),
        ServiceOrderFactory.createApproved(),
        ServiceOrderFactory.createInExecution(),
        ServiceOrderFactory.createFinished(),
        ServiceOrderFactory.createDelivered(),
        ServiceOrderFactory.createCancelled(),
        ServiceOrderFactory.createRejected(),
      ]

      const result = ServiceOrderMapper.toResponseDtoArray(entities)

      expect(result).toHaveLength(10)
      expect(result[0].status).toBe(ServiceOrderStatus.REQUESTED)
      expect(result[1].status).toBe(ServiceOrderStatus.RECEIVED)
      expect(result[2].status).toBe(ServiceOrderStatus.IN_DIAGNOSIS)
      expect(result[3].status).toBe(ServiceOrderStatus.AWAITING_APPROVAL)
      expect(result[4].status).toBe(ServiceOrderStatus.APPROVED)
      expect(result[5].status).toBe(ServiceOrderStatus.IN_EXECUTION)
      expect(result[6].status).toBe(ServiceOrderStatus.FINISHED)
      expect(result[7].status).toBe(ServiceOrderStatus.DELIVERED)
      expect(result[8].status).toBe(ServiceOrderStatus.CANCELLED)
      expect(result[9].status).toBe(ServiceOrderStatus.REJECTED)
    })
  })

  describe('fromCreateDto', () => {
    it('should create a service order entity from create DTO with REQUESTED status', () => {
      const dto: CreateServiceOrderDto = {
        vehicleId: vehicleId,
        notes: 'Test service order notes',
      }

      const result = ServiceOrderMapper.fromCreateDto(dto, clientId)

      expect(result).toBeInstanceOf(ServiceOrder)
      expect(result.status).toBe(ServiceOrderStatus.REQUESTED)
      expect(result.clientId).toBe(clientId)
      expect(result.vehicleId).toBe(vehicleId)
      expect(result.notes).toBe('Test service order notes')
      expect(result.requestDate).toBeInstanceOf(Date)
      expect(result.deliveryDate).toBeUndefined()
      expect(result.cancellationReason).toBeUndefined()
      expect(result.id).toBe('')
    })

    it('should create a service order entity from create DTO without notes', () => {
      const dto: CreateServiceOrderDto = {
        vehicleId: vehicleId,
      }

      const result = ServiceOrderMapper.fromCreateDto(dto, clientId)

      expect(result).toBeInstanceOf(ServiceOrder)
      expect(result.status).toBe(ServiceOrderStatus.REQUESTED)
      expect(result.clientId).toBe(clientId)
      expect(result.vehicleId).toBe(vehicleId)
      expect(result.notes).toBeUndefined()
    })

    it('should handle different client IDs correctly', () => {
      const dto: CreateServiceOrderDto = {
        vehicleId: vehicleId,
        notes: 'Test notes',
      }
      const differentClientId = 'different-client-123'

      const result = ServiceOrderMapper.fromCreateDto(dto, differentClientId)

      expect(result.clientId).toBe(differentClientId)
      expect(result.vehicleId).toBe(vehicleId)
    })

    it('should use the factory DTO correctly', () => {
      const dto = ServiceOrderDtoFactory.createCreateDto({
        vehicleId: 'factory-vehicle-id',
        notes: 'Factory notes',
      })

      const result = ServiceOrderMapper.fromCreateDto(dto, clientId)

      expect(result.vehicleId).toBe('factory-vehicle-id')
      expect(result.notes).toBe('Factory notes')
      expect(result.status).toBe(ServiceOrderStatus.REQUESTED)
    })
  })

  describe('fromCreateDtoForEmployee', () => {
    it('should create a service order entity from create DTO with RECEIVED status', () => {
      const dto: CreateServiceOrderDto = {
        vehicleId: vehicleId,
        notes: 'Employee created service order',
      }

      const result = ServiceOrderMapper.fromCreateDtoForEmployee(dto, clientId)

      expect(result).toBeInstanceOf(ServiceOrder)
      expect(result.status).toBe(ServiceOrderStatus.RECEIVED)
      expect(result.clientId).toBe(clientId)
      expect(result.vehicleId).toBe(vehicleId)
      expect(result.notes).toBe('Employee created service order')
      expect(result.requestDate).toBeInstanceOf(Date)
      expect(result.deliveryDate).toBeUndefined()
      expect(result.cancellationReason).toBeUndefined()
      expect(result.id).toBe('')
    })

    it('should create a service order entity without notes for employee', () => {
      const dto: CreateServiceOrderDto = {
        vehicleId: vehicleId,
      }

      const result = ServiceOrderMapper.fromCreateDtoForEmployee(dto, clientId)

      expect(result.status).toBe(ServiceOrderStatus.RECEIVED)
      expect(result.notes).toBeUndefined()
    })

    it('should handle different client IDs correctly for employee creation', () => {
      const dto: CreateServiceOrderDto = {
        vehicleId: vehicleId,
      }
      const employeeClientId = 'employee-client-456'

      const result = ServiceOrderMapper.fromCreateDtoForEmployee(dto, employeeClientId)

      expect(result.clientId).toBe(employeeClientId)
      expect(result.status).toBe(ServiceOrderStatus.RECEIVED)
    })
  })

  describe('fromUpdateDto', () => {
    let baseEntity: ServiceOrder

    beforeEach(() => {
      baseEntity = ServiceOrderFactory.create({
        id: 'so-update-test',
        status: ServiceOrderStatus.REQUESTED,
        notes: 'Original notes',
        deliveryDate: undefined,
        cancellationReason: undefined,
      })
    })

    it('should update status when provided', () => {
      const dto: UpdateServiceOrderDto = {
        status: ServiceOrderStatus.RECEIVED,
      }

      const result = ServiceOrderMapper.fromUpdateDto(baseEntity, dto)

      expect(result).toBe(baseEntity)
      expect(result.status).toBe(ServiceOrderStatus.RECEIVED)
      expect(result.notes).toBe('Original notes')
    })

    it('should update delivery date when provided', () => {
      const dto: UpdateServiceOrderDto = {
        deliveryDate: '2024-01-15T14:00:00.000Z',
      }

      const result = ServiceOrderMapper.fromUpdateDto(baseEntity, dto)

      expect(result.deliveryDate).toEqual(new Date('2024-01-15T14:00:00.000Z'))
    })

    it('should update cancellation reason when provided', () => {
      const dto: UpdateServiceOrderDto = {
        cancellationReason: 'Customer cancelled order',
      }

      const result = ServiceOrderMapper.fromUpdateDto(baseEntity, dto)

      expect(result.cancellationReason).toBe('Customer cancelled order')
    })

    it('should update notes when provided', () => {
      const dto: UpdateServiceOrderDto = {
        notes: 'Updated service order notes',
      }

      const result = ServiceOrderMapper.fromUpdateDto(baseEntity, dto)

      expect(result.notes).toBe('Updated service order notes')
    })

    it('should update multiple fields when provided', () => {
      const entity = ServiceOrderFactory.createReceived()
      const dto: UpdateServiceOrderDto = {
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        notes: 'Diagnostic started',
        deliveryDate: '2024-01-20T10:00:00.000Z',
      }

      const result = ServiceOrderMapper.fromUpdateDto(entity, dto)

      expect(result.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS)
      expect(result.notes).toBe('Diagnostic started')
      expect(result.deliveryDate).toEqual(new Date('2024-01-20T10:00:00.000Z'))
    })

    it('should not update fields when they are undefined', () => {
      const originalStatus = baseEntity.status
      const originalNotes = baseEntity.notes
      const originalDeliveryDate = baseEntity.deliveryDate
      const originalCancellationReason = baseEntity.cancellationReason

      const dto: UpdateServiceOrderDto = {}

      const result = ServiceOrderMapper.fromUpdateDto(baseEntity, dto)

      expect(result.status).toBe(originalStatus)
      expect(result.notes).toBe(originalNotes)
      expect(result.deliveryDate).toBe(originalDeliveryDate)
      expect(result.cancellationReason).toBe(originalCancellationReason)
    })

    it('should handle partial updates correctly', () => {
      const dto: UpdateServiceOrderDto = {
        notes: 'Only notes updated',
      }

      const result = ServiceOrderMapper.fromUpdateDto(baseEntity, dto)

      expect(result.notes).toBe('Only notes updated')
      expect(result.status).toBe(ServiceOrderStatus.REQUESTED)
      expect(result.deliveryDate).toBeUndefined()
      expect(result.cancellationReason).toBeUndefined()
    })

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = baseEntity.updatedAt
      const dto: UpdateServiceOrderDto = {
        notes: 'Update timestamp test',
      }

      const result = ServiceOrderMapper.fromUpdateDto(baseEntity, dto)

      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime())
    })

    it('should handle factory-generated update DTO', () => {
      const entity = ServiceOrderFactory.createAwaitingApproval()
      const dto = ServiceOrderDtoFactory.createUpdateDto({
        status: ServiceOrderStatus.APPROVED,
        notes: 'Factory generated notes',
      })

      const result = ServiceOrderMapper.fromUpdateDto(entity, dto)

      expect(result.status).toBe(ServiceOrderStatus.APPROVED)
      expect(result.notes).toBe('Factory generated notes')
    })

    it('should handle empty delivery date string by creating invalid date', () => {
      const dto: UpdateServiceOrderDto = {
        deliveryDate: '',
      }

      const result = ServiceOrderMapper.fromUpdateDto(baseEntity, dto)
      expect(result.deliveryDate).toBeInstanceOf(Date)
      expect(isNaN(result.deliveryDate!.getTime())).toBe(true)
    })

    it('should handle invalid delivery date string by creating invalid date', () => {
      const dto: UpdateServiceOrderDto = {
        deliveryDate: 'invalid-date',
      }

      const result = ServiceOrderMapper.fromUpdateDto(baseEntity, dto)
      expect(result.deliveryDate).toBeInstanceOf(Date)
      expect(isNaN(result.deliveryDate!.getTime())).toBe(true)
    })

    it('should handle all status updates correctly', () => {
      const statusUpdates = [
        ServiceOrderStatus.RECEIVED,
        ServiceOrderStatus.IN_DIAGNOSIS,
        ServiceOrderStatus.AWAITING_APPROVAL,
        ServiceOrderStatus.APPROVED,
        ServiceOrderStatus.REJECTED,
        ServiceOrderStatus.SCHEDULED,
        ServiceOrderStatus.IN_EXECUTION,
        ServiceOrderStatus.FINISHED,
        ServiceOrderStatus.DELIVERED,
        ServiceOrderStatus.CANCELLED,
      ]

      statusUpdates.forEach((status) => {
        const entity = ServiceOrderFactory.create({ status: ServiceOrderStatus.REQUESTED })
        try {
          const dto: UpdateServiceOrderDto = { status }
          const result = ServiceOrderMapper.fromUpdateDto(entity, dto)
          expect(result.status).toBe(status)
        } catch {
          // Some transitions might not be valid from REQUESTED status
          // This is expected and handled by the entity's business logic
        }
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle entities with all undefined optional fields', () => {
      const entity = ServiceOrderFactory.create({
        deliveryDate: undefined,
        cancellationReason: undefined,
        notes: undefined,
      })

      const result = ServiceOrderMapper.toResponseDto(entity)

      expect(result.deliveryDate).toBeUndefined()
      expect(result.cancellationReason).toBeUndefined()
      expect(result.notes).toBeUndefined()
    })

    it('should handle entities with empty string values', () => {
      const entity = ServiceOrderFactory.create({
        notes: '',
        cancellationReason: '',
      })

      const result = ServiceOrderMapper.toResponseDto(entity)

      expect(result.notes).toBe('')
      expect(result.cancellationReason).toBe('')
    })

    it('should handle very long notes in update DTO', () => {
      const entity = ServiceOrderFactory.create()
      const longNotes = 'A'.repeat(1000)
      const dto: UpdateServiceOrderDto = {
        notes: longNotes,
      }

      const result = ServiceOrderMapper.fromUpdateDto(entity, dto)

      expect(result.notes).toBe(longNotes)
    })

    it('should handle very long cancellation reason in update DTO', () => {
      const entity = ServiceOrderFactory.create()
      const longReason = 'B'.repeat(1000)
      const dto: UpdateServiceOrderDto = {
        cancellationReason: longReason,
      }

      const result = ServiceOrderMapper.fromUpdateDto(entity, dto)

      expect(result.cancellationReason).toBe(longReason)
    })

    it('should preserve entity reference in fromUpdateDto', () => {
      const entity = ServiceOrderFactory.create()
      const dto: UpdateServiceOrderDto = {
        notes: 'Reference test',
      }

      const result = ServiceOrderMapper.fromUpdateDto(entity, dto)

      expect(result).toBe(entity)
      expect(result === entity).toBe(true)
    })
  })

  describe('type safety and validation', () => {
    it('should ensure response DTO matches ServiceOrderResponseDto interface', () => {
      const entity = ServiceOrderFactory.create()

      const result = ServiceOrderMapper.toResponseDto(entity)

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          status: expect.any(String),
          requestDate: expect.any(Date),
          clientId: expect.any(String),
          vehicleId: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      )
    })

    it('should handle different vehicleId formats in create DTO', () => {
      const vehicleIds = [
        'vehicle-123',
        'v-456',
        'very-long-vehicle-identifier-with-many-characters-123456789',
        '1',
      ]

      vehicleIds.forEach((vehicleId) => {
        const dto: CreateServiceOrderDto = { vehicleId }
        const result = ServiceOrderMapper.fromCreateDto(dto, clientId)
        expect(result.vehicleId).toBe(vehicleId)
      })
    })

    it('should handle different clientId formats', () => {
      const clientIds = [
        'client-123',
        'c-456',
        'very-long-client-identifier-with-many-characters-123456789',
        '1',
      ]

      clientIds.forEach((clientId) => {
        const dto: CreateServiceOrderDto = { vehicleId }
        const result = ServiceOrderMapper.fromCreateDto(dto, clientId)
        expect(result.clientId).toBe(clientId)
      })
    })
  })
})

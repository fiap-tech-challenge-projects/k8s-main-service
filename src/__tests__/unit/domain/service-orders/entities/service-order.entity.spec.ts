import { ServiceOrderStatus } from '@prisma/client'

import { ServiceOrder } from '@domain/service-orders/entities'
import { InvalidServiceOrderStatusTransitionException } from '@domain/service-orders/exceptions'

describe('ServiceOrder Entity', () => {
  const clientId = 'client-test-123'
  const vehicleId = 'vehicle-test-456'
  const notes = 'Test service order notes'

  describe('create', () => {
    it('should create a service order with REQUESTED status', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId, notes)

      expect(serviceOrder).toBeInstanceOf(ServiceOrder)
      expect(serviceOrder.status).toBe(ServiceOrderStatus.REQUESTED)
      expect(serviceOrder.clientId).toBe(clientId)
      expect(serviceOrder.vehicleId).toBe(vehicleId)
      expect(serviceOrder.notes).toBe(notes)
      expect(serviceOrder.requestDate).toBeInstanceOf(Date)
      expect(serviceOrder.deliveryDate).toBeUndefined()
      expect(serviceOrder.cancellationReason).toBeUndefined()
      expect(serviceOrder.createdAt).toBeInstanceOf(Date)
      expect(serviceOrder.updatedAt).toBeInstanceOf(Date)
      expect(serviceOrder.id).toBe('')
    })

    it('should create a service order without notes', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      expect(serviceOrder.notes).toBeUndefined()
      expect(serviceOrder.status).toBe(ServiceOrderStatus.REQUESTED)
    })

    it('should set request date to current time', () => {
      const beforeCreate = new Date()
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)
      const afterCreate = new Date()

      expect(serviceOrder.requestDate.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
      expect(serviceOrder.requestDate.getTime()).toBeLessThanOrEqual(afterCreate.getTime())
    })
  })

  describe('createReceived', () => {
    it('should create a service order with RECEIVED status', () => {
      const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId, notes)

      expect(serviceOrder).toBeInstanceOf(ServiceOrder)
      expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED)
      expect(serviceOrder.clientId).toBe(clientId)
      expect(serviceOrder.vehicleId).toBe(vehicleId)
      expect(serviceOrder.notes).toBe(notes)
      expect(serviceOrder.requestDate).toBeInstanceOf(Date)
      expect(serviceOrder.deliveryDate).toBeUndefined()
      expect(serviceOrder.cancellationReason).toBeUndefined()
      expect(serviceOrder.createdAt).toBeInstanceOf(Date)
      expect(serviceOrder.updatedAt).toBeInstanceOf(Date)
      expect(serviceOrder.id).toBe('')
    })

    it('should create a service order without notes', () => {
      const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)

      expect(serviceOrder.notes).toBeUndefined()
      expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED)
    })
  })

  describe('constructor', () => {
    it('should create a service order with all parameters', () => {
      const id = 'so-test-789'
      const status = ServiceOrderStatus.IN_DIAGNOSIS
      const requestDate = new Date('2024-01-01T10:00:00.000Z')
      const deliveryDate = new Date('2024-01-05T15:00:00.000Z')
      const cancellationReason = 'Customer cancelled'
      const createdAt = new Date('2024-01-01T09:00:00.000Z')
      const updatedAt = new Date('2024-01-01T11:00:00.000Z')

      const serviceOrder = new ServiceOrder(
        id,
        status,
        requestDate,
        deliveryDate,
        cancellationReason,
        notes,
        clientId,
        vehicleId,
        createdAt,
        updatedAt,
      )

      expect(serviceOrder.id).toBe(id)
      expect(serviceOrder.status).toBe(status)
      expect(serviceOrder.requestDate).toBe(requestDate)
      expect(serviceOrder.deliveryDate).toBe(deliveryDate)
      expect(serviceOrder.cancellationReason).toBe(cancellationReason)
      expect(serviceOrder.notes).toBe(notes)
      expect(serviceOrder.clientId).toBe(clientId)
      expect(serviceOrder.vehicleId).toBe(vehicleId)
      expect(serviceOrder.createdAt).toBe(createdAt)
      expect(serviceOrder.updatedAt).toBe(updatedAt)
    })

    it('should create a service order with undefined optional parameters', () => {
      const id = 'so-test-789'
      const status = ServiceOrderStatus.REQUESTED
      const requestDate = new Date('2024-01-01T10:00:00.000Z')
      const createdAt = new Date('2024-01-01T09:00:00.000Z')
      const updatedAt = new Date('2024-01-01T11:00:00.000Z')

      const serviceOrder = new ServiceOrder(
        id,
        status,
        requestDate,
        undefined,
        undefined,
        undefined,
        clientId,
        vehicleId,
        createdAt,
        updatedAt,
      )

      expect(serviceOrder.deliveryDate).toBeUndefined()
      expect(serviceOrder.cancellationReason).toBeUndefined()
      expect(serviceOrder.notes).toBeUndefined()
    })
  })

  describe('status transition methods', () => {
    describe('markReceived', () => {
      it('should transition from REQUESTED to RECEIVED', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)
        const initialUpdatedAt = serviceOrder.updatedAt

        serviceOrder.markReceived()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED)
        expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
      })

      it('should throw exception for invalid transition', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()

        expect(() => serviceOrder.markReceived()).toThrow(
          InvalidServiceOrderStatusTransitionException,
        )
      })
    })

    describe('markInDiagnosis', () => {
      it('should transition from RECEIVED to IN_DIAGNOSIS', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        const initialUpdatedAt = serviceOrder.updatedAt

        serviceOrder.markInDiagnosis()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS)
        expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
      })

      it('should throw exception for invalid transition', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(() => serviceOrder.markInDiagnosis()).toThrow(
          InvalidServiceOrderStatusTransitionException,
        )
      })
    })

    describe('markAwaitingApproval', () => {
      it('should transition from IN_DIAGNOSIS to AWAITING_APPROVAL', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        const initialUpdatedAt = serviceOrder.updatedAt

        serviceOrder.markAwaitingApproval()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.AWAITING_APPROVAL)
        expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
      })

      it('should throw exception for invalid transition', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(() => serviceOrder.markAwaitingApproval()).toThrow(
          InvalidServiceOrderStatusTransitionException,
        )
      })
    })

    describe('markApproved', () => {
      it('should transition from AWAITING_APPROVAL to APPROVED', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()
        const initialUpdatedAt = serviceOrder.updatedAt

        serviceOrder.markApproved()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.APPROVED)
        expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
      })

      it('should throw exception for invalid transition', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(() => serviceOrder.markApproved()).toThrow(
          InvalidServiceOrderStatusTransitionException,
        )
      })
    })

    describe('markRejected', () => {
      it('should transition from AWAITING_APPROVAL to REJECTED', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()
        const initialUpdatedAt = serviceOrder.updatedAt

        serviceOrder.markRejected()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
        expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
      })

      it('should transition from REQUESTED to REJECTED', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        serviceOrder.markRejected()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
      })

      it('should allow transition from DELIVERED to REJECTED', () => {
        const serviceOrder = new ServiceOrder(
          'so-test',
          ServiceOrderStatus.DELIVERED,
          new Date(),
          undefined,
          undefined,
          undefined,
          clientId,
          vehicleId,
        )

        serviceOrder.markRejected()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
      })
    })

    describe('markInExecution', () => {
      it('should transition from APPROVED to IN_EXECUTION', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()
        serviceOrder.markApproved()
        const initialUpdatedAt = serviceOrder.updatedAt

        serviceOrder.markInExecution()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_EXECUTION)
        expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
      })

      it('should transition from SCHEDULED to IN_EXECUTION', () => {
        const serviceOrder = new ServiceOrder(
          'so-test',
          ServiceOrderStatus.SCHEDULED,
          new Date(),
          undefined,
          undefined,
          undefined,
          clientId,
          vehicleId,
        )

        serviceOrder.markInExecution()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_EXECUTION)
      })

      it('should throw exception for invalid transition', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(() => serviceOrder.markInExecution()).toThrow(
          InvalidServiceOrderStatusTransitionException,
        )
      })
    })

    describe('markFinished', () => {
      it('should transition from IN_EXECUTION to FINISHED', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()
        serviceOrder.markApproved()
        serviceOrder.markInExecution()
        const initialUpdatedAt = serviceOrder.updatedAt

        serviceOrder.markFinished()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.FINISHED)
        expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
      })

      it('should throw exception for invalid transition', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(() => serviceOrder.markFinished()).toThrow(
          InvalidServiceOrderStatusTransitionException,
        )
      })
    })

    describe('markDelivered', () => {
      it('should transition from FINISHED to DELIVERED', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()
        serviceOrder.markApproved()
        serviceOrder.markInExecution()
        serviceOrder.markFinished()
        const initialUpdatedAt = serviceOrder.updatedAt

        serviceOrder.markDelivered()

        expect(serviceOrder.status).toBe(ServiceOrderStatus.DELIVERED)
        expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
      })

      it('should throw exception for invalid transition', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(() => serviceOrder.markDelivered()).toThrow(
          InvalidServiceOrderStatusTransitionException,
        )
      })
    })

    describe('cancel', () => {
      it('should cancel a REQUESTED order with reason', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)
        const reason = 'Customer changed mind'
        const initialUpdatedAt = serviceOrder.updatedAt

        serviceOrder.cancel(reason)

        expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
        expect(serviceOrder.cancellationReason).toBe(reason)
        expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
      })

      it('should cancel a RECEIVED order with reason', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        const reason = 'Workshop capacity full'

        serviceOrder.cancel(reason)

        expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
        expect(serviceOrder.cancellationReason).toBe(reason)
      })

      it('should cancel an IN_DIAGNOSIS order with reason', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        const reason = 'Parts not available'

        serviceOrder.cancel(reason)

        expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
        expect(serviceOrder.cancellationReason).toBe(reason)
      })

      it('should throw exception when trying to cancel from invalid status', () => {
        const serviceOrder = new ServiceOrder(
          'so-test',
          ServiceOrderStatus.CANCELLED,
          new Date(),
          undefined,
          undefined,
          undefined,
          clientId,
          vehicleId,
        )

        expect(() => serviceOrder.cancel('Another reason')).toThrow(
          InvalidServiceOrderStatusTransitionException,
        )
      })
    })
  })

  describe('updateStatus', () => {
    it('should update status when transition is valid', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)
      const initialUpdatedAt = serviceOrder.updatedAt

      serviceOrder.updateStatus(ServiceOrderStatus.RECEIVED)

      expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED)
      expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
    })

    it('should throw exception when transition is invalid', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      expect(() => serviceOrder.updateStatus(ServiceOrderStatus.FINISHED)).toThrow(
        InvalidServiceOrderStatusTransitionException,
      )
    })
  })

  describe('updateDeliveryDate', () => {
    it('should update delivery date', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)
      const deliveryDate = new Date('2024-01-15T14:00:00.000Z')
      const initialUpdatedAt = serviceOrder.updatedAt

      serviceOrder.updateDeliveryDate(deliveryDate)

      expect(serviceOrder.deliveryDate).toBe(deliveryDate)
      expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
    })
  })

  describe('updateNotes', () => {
    it('should update notes', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)
      const newNotes = 'Updated service order notes'
      const initialUpdatedAt = serviceOrder.updatedAt

      serviceOrder.updateNotes(newNotes)

      expect(serviceOrder.notes).toBe(newNotes)
      expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
    })
  })

  describe('updateCancellationReason', () => {
    it('should update cancellation reason', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)
      const reason = 'Updated cancellation reason'
      const initialUpdatedAt = serviceOrder.updatedAt

      serviceOrder.updateCancellationReason(reason)

      expect(serviceOrder.cancellationReason).toBe(reason)
      expect(serviceOrder.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime())
    })
  })

  describe('business logic methods', () => {
    describe('canAddBudgetItems', () => {
      it('should return true when status is IN_DIAGNOSIS', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()

        expect(serviceOrder.canAddBudgetItems()).toBe(true)
      })

      it('should return false when status is not IN_DIAGNOSIS', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(serviceOrder.canAddBudgetItems()).toBe(false)
      })

      it('should return false when status is AWAITING_APPROVAL', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()

        expect(serviceOrder.canAddBudgetItems()).toBe(false)
      })
    })

    describe('canBeApprovedOrRejected', () => {
      it('should return true when status is AWAITING_APPROVAL', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()

        expect(serviceOrder.canBeApprovedOrRejected()).toBe(true)
      })

      it('should return false when status is not AWAITING_APPROVAL', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(serviceOrder.canBeApprovedOrRejected()).toBe(false)
      })

      it('should return false when status is APPROVED', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()
        serviceOrder.markApproved()

        expect(serviceOrder.canBeApprovedOrRejected()).toBe(false)
      })
    })

    describe('isInFinalState', () => {
      it('should return true when status is DELIVERED', () => {
        const serviceOrder = new ServiceOrder(
          'so-test',
          ServiceOrderStatus.DELIVERED,
          new Date(),
          undefined,
          undefined,
          undefined,
          clientId,
          vehicleId,
        )

        expect(serviceOrder.isInFinalState()).toBe(true)
      })

      it('should return true when status is CANCELLED', () => {
        const serviceOrder = new ServiceOrder(
          'so-test',
          ServiceOrderStatus.CANCELLED,
          new Date(),
          undefined,
          undefined,
          undefined,
          clientId,
          vehicleId,
        )

        expect(serviceOrder.isInFinalState()).toBe(true)
      })

      it('should return true when status is REJECTED', () => {
        const serviceOrder = new ServiceOrder(
          'so-test',
          ServiceOrderStatus.REJECTED,
          new Date(),
          undefined,
          undefined,
          undefined,
          clientId,
          vehicleId,
        )

        expect(serviceOrder.isInFinalState()).toBe(true)
      })

      it('should return false when status is not final', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(serviceOrder.isInFinalState()).toBe(false)
      })

      it('should return false when status is IN_EXECUTION', () => {
        const serviceOrder = new ServiceOrder(
          'so-test',
          ServiceOrderStatus.IN_EXECUTION,
          new Date(),
          undefined,
          undefined,
          undefined,
          clientId,
          vehicleId,
        )

        expect(serviceOrder.isInFinalState()).toBe(false)
      })

      it('should return false when status is FINISHED', () => {
        const serviceOrder = new ServiceOrder(
          'so-test',
          ServiceOrderStatus.FINISHED,
          new Date(),
          undefined,
          undefined,
          undefined,
          clientId,
          vehicleId,
        )

        expect(serviceOrder.isInFinalState()).toBe(false)
      })
    })
  })

  describe('inheritance from BaseEntity', () => {
    it('should inherit id, createdAt, and updatedAt properties', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      expect(serviceOrder).toHaveProperty('id')
      expect(serviceOrder).toHaveProperty('createdAt')
      expect(serviceOrder).toHaveProperty('updatedAt')
      expect(serviceOrder.createdAt).toBeInstanceOf(Date)
      expect(serviceOrder.updatedAt).toBeInstanceOf(Date)
    })

    it('should have equals method from BaseEntity', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      expect(serviceOrder).toHaveProperty('equals')
      expect(typeof serviceOrder.equals).toBe('function')
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings for optional fields', () => {
      const serviceOrder = new ServiceOrder(
        'so-test',
        ServiceOrderStatus.REQUESTED,
        new Date(),
        undefined,
        '',
        '',
        clientId,
        vehicleId,
      )

      expect(serviceOrder.cancellationReason).toBe('')
      expect(serviceOrder.notes).toBe('')
    })

    it('should handle past dates for requestDate', () => {
      const pastDate = new Date('2020-01-01T00:00:00.000Z')
      const serviceOrder = new ServiceOrder(
        'so-test',
        ServiceOrderStatus.REQUESTED,
        pastDate,
        undefined,
        undefined,
        undefined,
        clientId,
        vehicleId,
      )

      expect(serviceOrder.requestDate).toBe(pastDate)
    })

    it('should handle future dates for deliveryDate', () => {
      const futureDate = new Date('2025-12-31T23:59:59.999Z')
      const serviceOrder = new ServiceOrder(
        'so-test',
        ServiceOrderStatus.REQUESTED,
        new Date(),
        futureDate,
        undefined,
        undefined,
        clientId,
        vehicleId,
      )

      expect(serviceOrder.deliveryDate).toBe(futureDate)
    })
  })
})

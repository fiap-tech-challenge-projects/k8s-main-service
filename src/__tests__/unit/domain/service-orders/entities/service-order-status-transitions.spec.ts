import { ServiceOrderStatus } from '@prisma/client'

import { ServiceOrder } from '@domain/service-orders/entities'

describe('ServiceOrder Status Transitions', () => {
  const clientId = 'client-test-id'
  const vehicleId = 'vehicle-test-id'

  describe('Valid Status Transitions', () => {
    it('should allow transition from REQUESTED to RECEIVED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED)
    })

    it('should allow transition from REQUESTED to CANCELLED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.cancel('Customer cancelled')

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
      expect(serviceOrder.cancellationReason).toBe('Customer cancelled')
    })

    it('should allow transition from REQUESTED to REJECTED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markRejected()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
    })

    it('should allow transition from RECEIVED to IN_DIAGNOSIS', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS)
    })

    it('should allow transition from RECEIVED to CANCELLED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.cancel('Customer changed mind')

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
    })

    it('should allow transition from RECEIVED to REJECTED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markRejected()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
    })

    it('should allow transition from IN_DIAGNOSIS to AWAITING_APPROVAL', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.AWAITING_APPROVAL)
    })

    it('should allow transition from IN_DIAGNOSIS to CANCELLED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.cancel('Too expensive')

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
    })

    it('should allow transition from IN_DIAGNOSIS to REJECTED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markRejected()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
    })

    it('should allow transition from AWAITING_APPROVAL to APPROVED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.APPROVED)
    })

    it('should allow transition from AWAITING_APPROVAL to REJECTED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markRejected()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
    })

    it('should allow transition from AWAITING_APPROVAL to CANCELLED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.cancel('Budget not approved')

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
    })

    it('should allow transition from APPROVED to IN_EXECUTION', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markInExecution()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.IN_EXECUTION)
    })

    it('should allow transition from APPROVED to CANCELLED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.cancel('Parts not available')

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
    })

    it('should allow transition from APPROVED to REJECTED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markRejected()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
    })

    it('should allow transition from IN_EXECUTION to FINISHED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markInExecution()
      serviceOrder.markFinished()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.FINISHED)
    })

    it('should allow transition from IN_EXECUTION to CANCELLED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markInExecution()
      serviceOrder.cancel('Equipment failure')

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
    })

    it('should allow transition from IN_EXECUTION to REJECTED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markInExecution()
      serviceOrder.markRejected()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
    })

    it('should allow transition from FINISHED to DELIVERED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markInExecution()
      serviceOrder.markFinished()
      serviceOrder.markDelivered()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.DELIVERED)
    })

    it('should allow transition from FINISHED to CANCELLED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markInExecution()
      serviceOrder.markFinished()
      serviceOrder.cancel('Customer refused delivery')

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
    })

    it('should allow transition from FINISHED to REJECTED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markInExecution()
      serviceOrder.markFinished()
      serviceOrder.markRejected()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
    })

    it('should allow transition from DELIVERED to CANCELLED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markInExecution()
      serviceOrder.markFinished()
      serviceOrder.markDelivered()
      serviceOrder.cancel('Return request')

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
    })

    it('should allow transition from DELIVERED to REJECTED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()
      serviceOrder.markAwaitingApproval()
      serviceOrder.markApproved()
      serviceOrder.markInExecution()
      serviceOrder.markFinished()
      serviceOrder.markDelivered()
      serviceOrder.markRejected()

      expect(serviceOrder.status).toBe(ServiceOrderStatus.REJECTED)
    })

    it('should allow transition from REJECTED to CANCELLED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markRejected()
      serviceOrder.cancel('Final cancellation')

      expect(serviceOrder.status).toBe(ServiceOrderStatus.CANCELLED)
    })
  })

  describe('Invalid Status Transitions', () => {
    it('should throw error when trying to transition from REQUESTED to IN_DIAGNOSIS', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      expect(() => serviceOrder.markInDiagnosis()).toThrow(
        'Invalid status transition from REQUESTED to IN_DIAGNOSIS',
      )
    })

    it('should throw error when trying to transition from REQUESTED to AWAITING_APPROVAL', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      expect(() => serviceOrder.markAwaitingApproval()).toThrow(
        'Invalid status transition from REQUESTED to AWAITING_APPROVAL',
      )
    })

    it('should throw error when trying to transition from RECEIVED to AWAITING_APPROVAL', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()

      expect(() => serviceOrder.markAwaitingApproval()).toThrow(
        'Invalid status transition from RECEIVED to AWAITING_APPROVAL',
      )
    })

    it('should throw error when trying to transition from IN_DIAGNOSIS to APPROVED', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.markReceived()
      serviceOrder.markInDiagnosis()

      expect(() => serviceOrder.markApproved()).toThrow(
        'Invalid status transition from IN_DIAGNOSIS to APPROVED',
      )
    })

    it('should throw error when trying to transition from CANCELLED to any status', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.cancel('Cancelled')

      expect(() => serviceOrder.markReceived()).toThrow(
        'Invalid status transition from CANCELLED to RECEIVED',
      )
    })
  })

  describe('Business Logic Methods', () => {
    describe('canAddBudgetItems', () => {
      it('should return true when status is IN_DIAGNOSIS', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        serviceOrder.markReceived()
        serviceOrder.markInDiagnosis()

        expect(serviceOrder.canAddBudgetItems()).toBe(true)
      })

      it('should return false when status is not IN_DIAGNOSIS', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(serviceOrder.canAddBudgetItems()).toBe(false)

        serviceOrder.markReceived()
        expect(serviceOrder.canAddBudgetItems()).toBe(false)

        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()
        expect(serviceOrder.canAddBudgetItems()).toBe(false)
      })
    })

    describe('canBeApprovedOrRejected', () => {
      it('should return true when status is AWAITING_APPROVAL', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        serviceOrder.markReceived()
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()

        expect(serviceOrder.canBeApprovedOrRejected()).toBe(true)
      })

      it('should return false when status is not AWAITING_APPROVAL', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(serviceOrder.canBeApprovedOrRejected()).toBe(false)

        serviceOrder.markReceived()
        expect(serviceOrder.canBeApprovedOrRejected()).toBe(false)

        serviceOrder.markInDiagnosis()
        expect(serviceOrder.canBeApprovedOrRejected()).toBe(false)
      })
    })

    describe('isInFinalState', () => {
      it('should return true when status is DELIVERED', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        serviceOrder.markReceived()
        serviceOrder.markInDiagnosis()
        serviceOrder.markAwaitingApproval()
        serviceOrder.markApproved()
        serviceOrder.markInExecution()
        serviceOrder.markFinished()
        serviceOrder.markDelivered()

        expect(serviceOrder.isInFinalState()).toBe(true)
      })

      it('should return true when status is CANCELLED', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        serviceOrder.cancel('Cancelled')

        expect(serviceOrder.isInFinalState()).toBe(true)
      })

      it('should return true when status is REJECTED', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        serviceOrder.markRejected()

        expect(serviceOrder.isInFinalState()).toBe(true)
      })

      it('should return false when status is not final', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(serviceOrder.isInFinalState()).toBe(false)

        serviceOrder.markReceived()
        expect(serviceOrder.isInFinalState()).toBe(false)

        serviceOrder.markInDiagnosis()
        expect(serviceOrder.isInFinalState()).toBe(false)

        serviceOrder.markAwaitingApproval()
        expect(serviceOrder.isInFinalState()).toBe(false)

        serviceOrder.markApproved()
        expect(serviceOrder.isInFinalState()).toBe(false)

        serviceOrder.markInExecution()
        expect(serviceOrder.isInFinalState()).toBe(false)

        serviceOrder.markFinished()
        expect(serviceOrder.isInFinalState()).toBe(false)
      })
    })
  })

  describe('Factory Methods', () => {
    describe('create', () => {
      it('should create service order with REQUESTED status by default', () => {
        const serviceOrder = ServiceOrder.create(clientId, vehicleId)

        expect(serviceOrder.status).toBe(ServiceOrderStatus.REQUESTED)
        expect(serviceOrder.clientId).toBe(clientId)
        expect(serviceOrder.vehicleId).toBe(vehicleId)
        expect(serviceOrder.requestDate).toBeInstanceOf(Date)
        expect(serviceOrder.deliveryDate).toBeUndefined()
        expect(serviceOrder.cancellationReason).toBeUndefined()
        expect(serviceOrder.notes).toBeUndefined()
      })

      it('should create service order with notes when provided', () => {
        const notes = 'Customer requested urgent service'
        const serviceOrder = ServiceOrder.create(clientId, vehicleId, notes)

        expect(serviceOrder.status).toBe(ServiceOrderStatus.REQUESTED)
        expect(serviceOrder.notes).toBe(notes)
      })
    })

    describe('createReceived', () => {
      it('should create service order with RECEIVED status', () => {
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId)

        expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED)
        expect(serviceOrder.clientId).toBe(clientId)
        expect(serviceOrder.vehicleId).toBe(vehicleId)
        expect(serviceOrder.requestDate).toBeInstanceOf(Date)
        expect(serviceOrder.deliveryDate).toBeUndefined()
        expect(serviceOrder.cancellationReason).toBeUndefined()
        expect(serviceOrder.notes).toBeUndefined()
      })

      it('should create service order with notes when provided', () => {
        const notes = 'Received from customer directly'
        const serviceOrder = ServiceOrder.createReceived(clientId, vehicleId, notes)

        expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED)
        expect(serviceOrder.notes).toBe(notes)
      })
    })
  })

  describe('Update Methods', () => {
    it('should update delivery date', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)
      const deliveryDate = new Date('2023-12-25')

      serviceOrder.updateDeliveryDate(deliveryDate)

      expect(serviceOrder.deliveryDate).toBe(deliveryDate)
    })

    it('should update notes', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)
      const newNotes = 'Updated service notes'

      serviceOrder.updateNotes(newNotes)

      expect(serviceOrder.notes).toBe(newNotes)
    })

    it('should update cancellation reason', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)
      const cancellationReason = 'Customer requested cancellation'

      serviceOrder.updateCancellationReason(cancellationReason)

      expect(serviceOrder.cancellationReason).toBe(cancellationReason)
    })

    it('should update status using updateStatus method', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      serviceOrder.updateStatus(ServiceOrderStatus.RECEIVED)

      expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEIVED)
    })

    it('should validate status transition when using updateStatus', () => {
      const serviceOrder = ServiceOrder.create(clientId, vehicleId)

      expect(() => serviceOrder.updateStatus(ServiceOrderStatus.IN_DIAGNOSIS)).toThrow(
        'Invalid status transition from REQUESTED to IN_DIAGNOSIS',
      )
    })
  })
})

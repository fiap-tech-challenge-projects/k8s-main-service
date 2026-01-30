import { BudgetStatus, DeliveryMethod } from '@prisma/client'

import { Budget } from '@domain/budget/entities'
import {
  BudgetAlreadyApprovedException,
  BudgetAlreadyRejectedException,
  BudgetExpiredException,
  InvalidBudgetStatusException,
} from '@domain/budget/exceptions'
import { Price } from '@shared/value-objects'

describe('Budget', () => {
  const validServiceOrderId = 'service-order-123'
  const validClientId = 'client-456'
  const validTotalAmount = 150075 // cents
  const validValidityPeriod = 7
  const validDeliveryMethod = DeliveryMethod.EMAIL
  const validNotes = 'Additional budget notes'

  describe('constructor', () => {
    it('should create a budget with all required fields', () => {
      const mockDate = new Date('2023-01-01T10:00:00Z')
      const budget = new Budget(
        'budget-123',
        BudgetStatus.GENERATED,
        Price.create(validTotalAmount),
        validValidityPeriod,
        mockDate,
        validServiceOrderId,
        validClientId,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockDate,
        mockDate,
      )

      expect(budget.id).toBe('budget-123')
      expect(budget.status).toBe(BudgetStatus.GENERATED)
      expect(budget.totalAmount.getValue()).toBe(validTotalAmount)
      expect(budget.validityPeriod).toBe(validValidityPeriod)
      expect(budget.generationDate).toBe(mockDate)
      expect(budget.serviceOrderId).toBe(validServiceOrderId)
      expect(budget.clientId).toBe(validClientId)
      expect(budget.sentDate).toBeUndefined()
      expect(budget.approvalDate).toBeUndefined()
      expect(budget.rejectionDate).toBeUndefined()
      expect(budget.deliveryMethod).toBeUndefined()
      expect(budget.notes).toBeUndefined()
      expect(budget.createdAt).toBe(mockDate)
      expect(budget.updatedAt).toBe(mockDate)
      // budgetItems property no longer exists
    })

    it('should create a budget with all optional fields', () => {
      const mockDate = new Date('2023-01-01T10:00:00Z')
      const sentDate = new Date('2023-01-02T10:00:00Z')
      const approvalDate = new Date('2023-01-03T10:00:00Z')
      const budget = new Budget(
        'budget-456',
        BudgetStatus.APPROVED,
        Price.create(validTotalAmount),
        validValidityPeriod,
        mockDate,
        validServiceOrderId,
        validClientId,
        sentDate,
        approvalDate,
        undefined,
        validDeliveryMethod,
        validNotes,
        mockDate,
        mockDate,
      )

      expect(budget.id).toBe('budget-456')
      expect(budget.status).toBe(BudgetStatus.APPROVED)
      expect(budget.sentDate).toBe(sentDate)
      expect(budget.approvalDate).toBe(approvalDate)
      expect(budget.rejectionDate).toBeUndefined()
      expect(budget.deliveryMethod).toBe(validDeliveryMethod)
      expect(budget.notes).toBe(validNotes)
    })
  })

  describe('create', () => {
    it('should create a new budget with all required fields', () => {
      const budget = Budget.create(
        validServiceOrderId,
        validClientId,
        validValidityPeriod,
        validDeliveryMethod,
        validNotes,
        BudgetStatus.GENERATED,
        validTotalAmount,
      )

      expect(budget.totalAmount.getValue()).toBe(validTotalAmount)
      expect(budget.validityPeriod).toBe(validValidityPeriod)
      expect(budget.clientId).toBe(validClientId)
      expect(budget.validityPeriod).toBe(validValidityPeriod)
      expect(budget.status).toBe(BudgetStatus.GENERATED)
      expect(budget.id).toBeDefined()
      expect(budget.id).toMatch(/^budget-\d+-[a-z0-9]+$/)
      expect(budget.generationDate).toBeInstanceOf(Date)
      expect(budget.createdAt).toBeInstanceOf(Date)
      expect(budget.updatedAt).toBeInstanceOf(Date)
    })

    it('should create a budget with optional fields', () => {
      const budget = Budget.create(
        validServiceOrderId,
        validClientId,
        validValidityPeriod,
        validDeliveryMethod,
        validNotes,
        BudgetStatus.SENT,
        validTotalAmount,
      )

      expect(budget.deliveryMethod).toBe(validDeliveryMethod)
      expect(budget.notes).toBe(validNotes)
      expect(budget.status).toBe(BudgetStatus.SENT)
    })

    it('should generate unique IDs for different budgets', () => {
      const budget1 = Budget.create(
        validServiceOrderId,
        validClientId,
        validValidityPeriod,
        validDeliveryMethod,
        validNotes,
        BudgetStatus.GENERATED,
        validTotalAmount,
      )
      const budget2 = Budget.create(
        'service-order-789',
        'client-999',
        14,
        DeliveryMethod.WHATSAPP,
        undefined,
        BudgetStatus.GENERATED,
        200000,
      )

      expect(budget1.id).not.toBe(budget2.id)
    })

    it('should create budget without delivery method when not provided', () => {
      const budget = Budget.create(
        validServiceOrderId,
        validClientId,
        validValidityPeriod,
        undefined,
        validNotes,
        BudgetStatus.GENERATED,
        validTotalAmount,
      )

      expect(budget.deliveryMethod).toBeUndefined()
      expect(budget.notes).toBe(validNotes)
    })
  })

  describe('update', () => {
    let originalBudget: Budget

    beforeEach(() => {
      originalBudget = Budget.create(
        validServiceOrderId,
        validClientId,
        validValidityPeriod,
        validDeliveryMethod,
        validNotes,
        BudgetStatus.GENERATED,
        validTotalAmount,
      )
    })

    it('should update status', () => {
      // First transition to SENT, then to APPROVED
      originalBudget.updateStatus(BudgetStatus.SENT)
      originalBudget.updateStatus(BudgetStatus.APPROVED)

      expect(originalBudget.status).toBe(BudgetStatus.APPROVED)
      expect(originalBudget.totalAmount.getValue()).toBe(validTotalAmount)
      expect(originalBudget.validityPeriod).toBe(validValidityPeriod)
    })

    it('should update total amount', () => {
      const newAmount = 250000
      originalBudget.updateTotalAmount(newAmount)

      expect(originalBudget.totalAmount.getValue()).toBe(newAmount)
    })

    it('should update validity period', () => {
      const newValidityPeriod = 14
      originalBudget.updateValidityPeriod(newValidityPeriod)

      expect(originalBudget.validityPeriod).toBe(newValidityPeriod)
    })

    it('should update dates', () => {
      const sentDate = new Date('2023-01-02T10:00:00Z')
      const approvalDate = new Date('2023-01-03T10:00:00Z')
      const rejectionDate = new Date('2023-01-04T10:00:00Z')

      originalBudget.updateSentDate(sentDate)
      originalBudget.updateApprovalDate(approvalDate)
      originalBudget.updateRejectionDate(rejectionDate)

      expect(originalBudget.sentDate).toBe(sentDate)
      expect(originalBudget.approvalDate).toBe(approvalDate)
      expect(originalBudget.rejectionDate).toBe(rejectionDate)
    })

    it('should update delivery method', () => {
      const newDeliveryMethod = DeliveryMethod.WHATSAPP
      originalBudget.updateDeliveryMethod(newDeliveryMethod)

      expect(originalBudget.deliveryMethod).toBe(DeliveryMethod.WHATSAPP)
    })

    it('should update notes', () => {
      const newNotes = 'Updated budget notes'
      originalBudget.updateNotes(newNotes)

      expect(originalBudget.notes).toBe(newNotes)
    })

    it('should update multiple fields at once', () => {
      const newAmount = 3000.0
      const newNotes = 'Multiple updates'
      const rejectionDate = new Date('2023-01-05T10:00:00Z')

      // Update total amount and notes
      originalBudget.updateTotalAmount(newAmount)
      originalBudget.updateNotes(newNotes)
      originalBudget.updateRejectionDate(rejectionDate)
      originalBudget.updateStatus(BudgetStatus.REJECTED)

      expect(originalBudget.status).toBe(BudgetStatus.REJECTED)
      expect(originalBudget.totalAmount.getValue()).toBe(newAmount)
      expect(originalBudget.rejectionDate).toBe(rejectionDate)
      expect(originalBudget.notes).toBe(newNotes)
    })
  })

  describe('edge cases and validation', () => {
    it('should handle zero total amount', () => {
      const budget = Budget.create(
        validServiceOrderId,
        validClientId,
        validValidityPeriod,
        validDeliveryMethod,
        undefined,
        BudgetStatus.GENERATED,
        0,
      )

      expect(budget.totalAmount.getValue()).toBe(0)
    })

    it('should handle minimum validity period', () => {
      const budget = Budget.create(
        validServiceOrderId,
        validClientId,
        1,
        validDeliveryMethod,
        undefined,
        BudgetStatus.GENERATED,
        validTotalAmount,
      )

      expect(budget.validityPeriod).toBe(1)
    })
  })
})

describe('Budget status transitions and exceptions', () => {
  const validServiceOrderId = 'service-order-123'
  const validClientId = 'client-456'
  const validTotalAmount = 150075
  const validValidityPeriod = 30 // ensure not expired
  const now = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days in the future

  function makeBudget(
    status: BudgetStatus = BudgetStatus.GENERATED,
    overrides: Partial<Budget> = {},
  ) {
    return new Budget(
      'budget-1',
      status,
      Price.create(validTotalAmount),
      validValidityPeriod,
      overrides.generationDate ?? now,
      validServiceOrderId,
      validClientId,
      overrides.sentDate,
      overrides.approvalDate,
      overrides.rejectionDate,
      overrides.deliveryMethod,
      overrides.notes,
      now,
      now,
    )
  }

  it('should approve a budget from SENT', () => {
    const budget = makeBudget(BudgetStatus.SENT)
    budget.approve()
    expect(budget.status).toBe(BudgetStatus.APPROVED)
    expect(budget.approvalDate).toBeInstanceOf(Date)
  })

  it('should throw exception when approving already approved budget', () => {
    const budget = makeBudget(BudgetStatus.APPROVED)
    expect(() => budget.approve()).toThrow(BudgetAlreadyApprovedException)
  })

  it('should throw exception when approving expired budget', () => {
    const expiredBudget = makeBudget(BudgetStatus.SENT, { generationDate: new Date('2000-01-01') })
    expect(() => expiredBudget.approve()).toThrow(BudgetExpiredException)
  })

  it('should reject a budget from SENT', () => {
    const budget = makeBudget(BudgetStatus.SENT)
    budget.reject()
    expect(budget.status).toBe(BudgetStatus.REJECTED)
    expect(budget.rejectionDate).toBeInstanceOf(Date)
  })

  it('should throw exception when rejecting already rejected budget', () => {
    const budget = makeBudget(BudgetStatus.REJECTED)
    expect(() => budget.reject()).toThrow(BudgetAlreadyRejectedException)
  })

  it('should throw exception when rejecting expired budget', () => {
    const expiredBudget = makeBudget(BudgetStatus.SENT, { generationDate: new Date('2000-01-01') })
    expect(() => expiredBudget.reject()).toThrow(BudgetExpiredException)
  })

  it('should send a budget from GENERATED', () => {
    const budget = makeBudget(BudgetStatus.GENERATED)
    budget.send()
    expect(budget.status).toBe(BudgetStatus.SENT)
    expect(budget.sentDate).toBeInstanceOf(Date)
  })

  it('should throw exception when sending budget from invalid status', () => {
    const budget = makeBudget(BudgetStatus.APPROVED)
    expect(() => budget.send()).toThrow(InvalidBudgetStatusException)
  })

  it('should mark as received from SENT', () => {
    const budget = makeBudget(BudgetStatus.SENT)
    budget.markAsReceived()
    expect(budget.status).toBe(BudgetStatus.RECEIVED)
  })

  it('should mark as expired from GENERATED', () => {
    const budget = makeBudget(BudgetStatus.GENERATED)
    budget.markAsExpired()
    expect(budget.status).toBe(BudgetStatus.EXPIRED)
  })

  it('should check isExpired and getExpirationDate', () => {
    const budget = makeBudget(BudgetStatus.GENERATED)
    expect(budget.isExpired()).toBe(false)
    const expDate = budget.getExpirationDate()
    expect(expDate).toBeInstanceOf(Date)
  })

  it('should recalculate total amount', () => {
    const budget = makeBudget()
    const items = [{ totalPrice: Price.create(1000) }, { totalPrice: Price.create(2000) }]
    const updated = budget.recalculateTotalAmount(items)
    expect(updated.totalAmount.getValue()).toBe(3000)
  })

  it('should calculate total amount statically', () => {
    const items = [{ totalPrice: Price.create(1000) }, { totalPrice: Price.create(2000) }]
    const total = Budget.calculateTotalAmount(items)
    expect(total.getValue()).toBe(3000)
  })

  it('should format total amount', () => {
    const budget = makeBudget()
    expect(typeof budget.getFormattedTotalAmount()).toBe('string')
  })
})

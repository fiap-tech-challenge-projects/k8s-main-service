import { BudgetStatus, DeliveryMethod } from '@prisma/client'

import { CreateBudgetDto, UpdateBudgetDto } from '@application/budget/dto'
import { BudgetMapper } from '@application/budget/mappers'
import { Budget } from '@domain/budget/entities'
import { Price } from '@shared/value-objects'

describe('BudgetMapper', () => {
  const mockDate = new Date('2024-08-13T10:00:00.000Z')

  const createMockBudget = (overrides: Partial<any> = {}): Budget => {
    return new Budget(
      overrides.id ?? 'budget-123',
      overrides.status ?? BudgetStatus.GENERATED,
      overrides.totalAmount ?? Price.create('150000'),
      overrides.validityPeriod ?? 7,
      overrides.generationDate ?? mockDate,
      overrides.serviceOrderId ?? 'so-123',
      overrides.clientId ?? 'client-123',
      overrides.sentDate ?? undefined,
      overrides.approvalDate ?? undefined,
      overrides.rejectionDate ?? undefined,
      overrides.deliveryMethod ?? DeliveryMethod.EMAIL,
      overrides.notes ?? 'Test notes',
      overrides.createdAt ?? mockDate,
      overrides.updatedAt ?? mockDate,
    )
  }

  describe('toResponseDto', () => {
    it('should convert Budget entity to BudgetResponseDto', () => {
      const budget = createMockBudget()

      const result = BudgetMapper.toResponseDto(budget)

      expect(result).toEqual({
        id: 'budget-123',
        status: BudgetStatus.GENERATED,
        totalAmount: Price.create('150000').getFormatted(),
        validityPeriod: 7,
        generationDate: mockDate,
        sentDate: undefined,
        approvalDate: undefined,
        rejectionDate: undefined,
        deliveryMethod: DeliveryMethod.EMAIL,
        notes: 'Test notes',
        serviceOrderId: 'so-123',
        clientId: 'client-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      })
    })

    it('should convert Budget entity with optional dates to BudgetResponseDto', () => {
      const sentDate = new Date('2024-08-14T10:00:00.000Z')
      const approvalDate = new Date('2024-08-15T10:00:00.000Z')

      const budget = createMockBudget({
        sentDate,
        approvalDate,
        status: BudgetStatus.APPROVED,
      })

      const result = BudgetMapper.toResponseDto(budget)

      expect(result.sentDate).toBe(sentDate)
      expect(result.approvalDate).toBe(approvalDate)
      expect(result.status).toBe(BudgetStatus.APPROVED)
    })

    it('should convert Budget entity with rejection date to BudgetResponseDto', () => {
      const rejectionDate = new Date('2024-08-16T10:00:00.000Z')

      const budget = createMockBudget({
        rejectionDate,
        status: BudgetStatus.REJECTED,
      })

      const result = BudgetMapper.toResponseDto(budget)

      expect(result.rejectionDate).toBe(rejectionDate)
      expect(result.status).toBe(BudgetStatus.REJECTED)
    })

    it('should handle Budget entity without delivery method', () => {
      const budgetWithoutDelivery = new Budget(
        'budget-123',
        BudgetStatus.GENERATED,
        Price.create('150000'),
        7,
        mockDate,
        'so-123',
        'client-123',
        undefined,
        undefined,
        undefined,
        undefined, // no delivery method
        'Test notes',
        mockDate,
        mockDate,
      )

      const result = BudgetMapper.toResponseDto(budgetWithoutDelivery)

      expect(result.deliveryMethod).toBeUndefined()
    })

    it('should handle Budget entity without notes', () => {
      const budgetWithoutNotes = new Budget(
        'budget-123',
        BudgetStatus.GENERATED,
        Price.create('150000'),
        7,
        mockDate,
        'so-123',
        'client-123',
        undefined,
        undefined,
        undefined,
        DeliveryMethod.EMAIL,
        undefined, // no notes
        mockDate,
        mockDate,
      )

      const result = BudgetMapper.toResponseDto(budgetWithoutNotes)

      expect(result.notes).toBeUndefined()
    })
  })

  describe('toResponseDtoArray', () => {
    it('should convert array of Budget entities to BudgetResponseDto array', () => {
      const budgets = [
        createMockBudget({ id: 'budget-1' }),
        createMockBudget({ id: 'budget-2', status: BudgetStatus.APPROVED }),
      ]

      const result = BudgetMapper.toResponseDtoArray(budgets)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('budget-1')
      expect(result[1].id).toBe('budget-2')
      expect(result[1].status).toBe(BudgetStatus.APPROVED)
    })

    it('should return empty array when given empty array', () => {
      const result = BudgetMapper.toResponseDtoArray([])

      expect(result).toEqual([])
    })
  })

  describe('fromCreateDto', () => {
    it('should convert CreateBudgetDto to Budget entity', () => {
      const createDto: CreateBudgetDto = {
        totalAmount: '200050',
        serviceOrderId: 'so-456',
        clientId: 'client-456',
        validityPeriod: 10,
        deliveryMethod: DeliveryMethod.SMS,
        notes: 'Custom notes',
      }

      const result = BudgetMapper.fromCreateDto(createDto)

      expect(result).toBeInstanceOf(Budget)
      expect(result.totalAmount.getValue()).toBe(200050)
      expect(result.serviceOrderId).toBe('so-456')
      expect(result.clientId).toBe('client-456')
      expect(result.validityPeriod).toBe(10)
      expect(result.deliveryMethod).toBe(DeliveryMethod.SMS)
      expect(result.notes).toBe('Custom notes')
      expect(result.status).toBe(BudgetStatus.GENERATED)
    })

    it('should convert CreateBudgetDto without optional fields to Budget entity', () => {
      const createDto: CreateBudgetDto = {
        totalAmount: '180000',
        serviceOrderId: 'so-789',
        clientId: 'client-789',
        validityPeriod: 5,
      }

      const result = BudgetMapper.fromCreateDto(createDto)

      expect(result).toBeInstanceOf(Budget)
      expect(result.totalAmount.getValue()).toBe(180000)
      expect(result.serviceOrderId).toBe('so-789')
      expect(result.clientId).toBe('client-789')
      expect(result.validityPeriod).toBe(5)
      expect(result.deliveryMethod).toBeUndefined()
      expect(result.notes).toBeUndefined()
    })

    it('should handle CreateBudgetDto with EMAIL delivery method', () => {
      const createDto: CreateBudgetDto = {
        totalAmount: '120000',
        serviceOrderId: 'so-101',
        clientId: 'client-101',
        validityPeriod: 7,
        deliveryMethod: DeliveryMethod.EMAIL,
      }

      const result = BudgetMapper.fromCreateDto(createDto)

      expect(result.deliveryMethod).toBe(DeliveryMethod.EMAIL)
    })

    it('should handle CreateBudgetDto with WHATSAPP delivery method', () => {
      const createDto: CreateBudgetDto = {
        totalAmount: '120000',
        serviceOrderId: 'so-102',
        clientId: 'client-102',
        validityPeriod: 7,
        deliveryMethod: DeliveryMethod.WHATSAPP,
      }

      const result = BudgetMapper.fromCreateDto(createDto)

      expect(result.deliveryMethod).toBe(DeliveryMethod.WHATSAPP)
    })
  })

  describe('fromUpdateDto', () => {
    let existingBudget: Budget

    beforeEach(() => {
      existingBudget = createMockBudget({
        id: 'budget-update-test',
        status: BudgetStatus.GENERATED,
        totalAmount: Price.create('100000'),
        validityPeriod: 7,
      })
    })

    it('should convert UpdateBudgetDto to updated Budget entity', () => {
      // To approve, must start from SENT status
      const sentBudget = createMockBudget({
        id: 'budget-update-test',
        status: BudgetStatus.SENT,
        totalAmount: Price.create('100000'),
        validityPeriod: 7,
      })
      const updateDto: UpdateBudgetDto = {
        status: BudgetStatus.APPROVED,
        totalAmount: '150000',
        validityPeriod: 14,
        deliveryMethod: DeliveryMethod.SMS,
        notes: 'Updated notes',
      }

      const result = BudgetMapper.fromUpdateDto(updateDto, sentBudget)

      expect(result).toBeInstanceOf(Budget)
      expect(result.id).toBe('budget-update-test')
      expect(result.status).toBe(BudgetStatus.APPROVED)
      expect(result.totalAmount.getValue()).toBe(150000)
      expect(result.validityPeriod).toBe(14)
      expect(result.deliveryMethod).toBe(DeliveryMethod.SMS)
      expect(result.notes).toBe('Updated notes')
    })

    it('should update only provided fields in UpdateBudgetDto', () => {
      const updateDto: UpdateBudgetDto = {
        status: BudgetStatus.SENT,
        totalAmount: '200000',
      }

      const result = BudgetMapper.fromUpdateDto(updateDto, existingBudget)

      expect(result.status).toBe(BudgetStatus.SENT)
      expect(result.totalAmount.getValue()).toBe(200000)
      expect(result.validityPeriod).toBe(7) // unchanged
      expect(result.deliveryMethod).toBe(DeliveryMethod.EMAIL) // unchanged
      expect(result.notes).toBe('Test notes') // unchanged
    })

    it('should update with sent date', () => {
      const sentDate = new Date('2024-08-14T12:00:00.000Z')
      const updateDto: UpdateBudgetDto = {
        sentDate,
        status: BudgetStatus.SENT,
      }

      const result = BudgetMapper.fromUpdateDto(updateDto, existingBudget)

      expect(result.sentDate).toBe(sentDate)
      expect(result.status).toBe(BudgetStatus.SENT)
    })

    it('should update with approval date', () => {
      // To approve, must start from SENT status
      const sentBudget = createMockBudget({
        id: 'budget-update-test',
        status: BudgetStatus.SENT,
        totalAmount: Price.create('100000'),
        validityPeriod: 7,
      })
      const approvalDate = new Date('2024-08-15T12:00:00.000Z')
      const updateDto: UpdateBudgetDto = {
        approvalDate,
        status: BudgetStatus.APPROVED,
      }

      const result = BudgetMapper.fromUpdateDto(updateDto, sentBudget)

      expect(result.approvalDate).toBe(approvalDate)
      expect(result.status).toBe(BudgetStatus.APPROVED)
    })

    it('should update with rejection date', () => {
      // To reject, must start from SENT status
      const sentBudget = createMockBudget({
        id: 'budget-update-test',
        status: BudgetStatus.SENT,
        totalAmount: Price.create('100000'),
        validityPeriod: 7,
      })
      const rejectionDate = new Date('2024-08-16T12:00:00.000Z')
      const updateDto: UpdateBudgetDto = {
        rejectionDate,
        status: BudgetStatus.REJECTED,
      }

      const result = BudgetMapper.fromUpdateDto(updateDto, sentBudget)

      expect(result.rejectionDate).toBe(rejectionDate)
      expect(result.status).toBe(BudgetStatus.REJECTED)
    })

    it('should handle partial update with only status change', () => {
      const updateDto: UpdateBudgetDto = {
        status: BudgetStatus.EXPIRED,
      }

      const result = BudgetMapper.fromUpdateDto(updateDto, existingBudget)

      expect(result.status).toBe(BudgetStatus.EXPIRED)
      expect(result.totalAmount.getValue()).toBe(existingBudget.totalAmount.getValue()) // unchanged
      expect(result.validityPeriod).toBe(existingBudget.validityPeriod) // unchanged
    })

    it('should handle update with delivery method change', () => {
      const updateDto: UpdateBudgetDto = {
        deliveryMethod: DeliveryMethod.WHATSAPP,
      }

      const result = BudgetMapper.fromUpdateDto(updateDto, existingBudget)

      expect(result.deliveryMethod).toBe(DeliveryMethod.WHATSAPP)
    })

    it('should handle update with notes change', () => {
      const updateDto: UpdateBudgetDto = {
        notes: 'Completely new notes',
      }

      const result = BudgetMapper.fromUpdateDto(updateDto, existingBudget)

      expect(result.notes).toBe('Completely new notes')
    })

    it('should handle empty UpdateBudgetDto (no changes)', () => {
      const updateDto: UpdateBudgetDto = {}

      const result = BudgetMapper.fromUpdateDto(updateDto, existingBudget)

      expect(result.status).toBe(existingBudget.status)
      expect(result.totalAmount.getValue()).toBe(existingBudget.totalAmount.getValue())
      expect(result.validityPeriod).toBe(existingBudget.validityPeriod)
      expect(result.deliveryMethod).toBe(existingBudget.deliveryMethod)
      expect(result.notes).toBe(existingBudget.notes)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle Budget entity with different statuses in toResponseDto', () => {
      const statuses = [
        BudgetStatus.GENERATED,
        BudgetStatus.SENT,
        BudgetStatus.APPROVED,
        BudgetStatus.REJECTED,
        BudgetStatus.EXPIRED,
      ]

      statuses.forEach((status) => {
        const budget = createMockBudget({ status })
        const result = BudgetMapper.toResponseDto(budget)
        expect(result.status).toBe(status)
      })
    })

    it('should preserve all dates correctly in toResponseDto', () => {
      const generationDate = new Date('2024-08-13T10:00:00.000Z')
      const sentDate = new Date('2024-08-14T11:00:00.000Z')
      const approvalDate = new Date('2024-08-15T12:00:00.000Z')
      const createdAt = new Date('2024-08-13T09:00:00.000Z')
      const updatedAt = new Date('2024-08-16T13:00:00.000Z')

      const budget = createMockBudget({
        generationDate,
        sentDate,
        approvalDate,
        createdAt,
        updatedAt,
      })

      const result = BudgetMapper.toResponseDto(budget)

      expect(result.generationDate).toBe(generationDate)
      expect(result.sentDate).toBe(sentDate)
      expect(result.approvalDate).toBe(approvalDate)
      expect(result.createdAt).toBe(createdAt)
      expect(result.updatedAt).toBe(updatedAt)
    })

    it('should handle multiple delivery methods in fromCreateDto', () => {
      const deliveryMethods = [DeliveryMethod.EMAIL, DeliveryMethod.SMS, DeliveryMethod.WHATSAPP]

      deliveryMethods.forEach((method) => {
        const createDto: CreateBudgetDto = {
          totalAmount: '100000',
          serviceOrderId: 'so-test',
          clientId: 'client-test',
          validityPeriod: 7,
          deliveryMethod: method,
        }

        const result = BudgetMapper.fromCreateDto(createDto)
        expect(result.deliveryMethod).toBe(method)
      })
    })
  })
})

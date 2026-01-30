import { BudgetItemType } from '@prisma/client'

import { BudgetItem } from '@domain/budget-items/entities'
import { Price } from '@shared/value-objects'

describe('BudgetItem', () => {
  const validType = BudgetItemType.SERVICE
  const validDescription = 'Troca de óleo do motor'
  const validQuantity = 2
  const validUnitPrice = 'R$ 150,00'
  const validBudgetId = 'budget_123'
  const validNotes = 'Óleo sintético'
  const validServiceId = 'service_456'

  describe('constructor', () => {
    it('should create a new budget item with all required fields', () => {
      const unitPriceValueObject = Price.create(validUnitPrice)
      const budgetItem = new BudgetItem(
        'budget_item_123',
        validType,
        validDescription,
        validQuantity,
        unitPriceValueObject,
        validBudgetId,
        validNotes,
        undefined,
        validServiceId,
      )

      expect(budgetItem.id).toBe('budget_item_123')
      expect(budgetItem.type).toBe(validType)
      expect(budgetItem.description).toBe(validDescription)
      expect(budgetItem.quantity).toBe(validQuantity)
      expect(budgetItem.unitPrice).toBe(unitPriceValueObject)
      expect(budgetItem.budgetId).toBe(validBudgetId)
      expect(budgetItem.notes).toBe(validNotes)
      expect(budgetItem.stockItemId).toBeUndefined()
      expect(budgetItem.serviceId).toBe(validServiceId)
      expect(budgetItem.createdAt).toBeInstanceOf(Date)
      expect(budgetItem.updatedAt).toBeInstanceOf(Date)
    })

    it('should calculate total price correctly', () => {
      const unitPriceValueObject = Price.create(validUnitPrice)
      const budgetItem = new BudgetItem(
        'budget_item_123',
        validType,
        validDescription,
        validQuantity,
        unitPriceValueObject,
        validBudgetId,
      )

      const expectedTotal = unitPriceValueObject.getValue() * validQuantity
      expect(budgetItem.totalPrice.getValue()).toBe(expectedTotal)
    })

    it('should handle optional fields as undefined', () => {
      const unitPriceValueObject = Price.create(validUnitPrice)
      const budgetItem = new BudgetItem(
        'budget_item_123',
        validType,
        validDescription,
        validQuantity,
        unitPriceValueObject,
        validBudgetId,
      )

      expect(budgetItem.notes).toBeUndefined()
      expect(budgetItem.stockItemId).toBeUndefined()
      expect(budgetItem.serviceId).toBeUndefined()
    })
  })
  describe('update', () => {
    let originalBudgetItem: BudgetItem
    beforeEach(() => {
      originalBudgetItem = new BudgetItem(
        'budget_item_123',
        validType,
        validDescription,
        validQuantity,
        Price.create(validUnitPrice),
        validBudgetId,
        validNotes,
        undefined,
        validServiceId,
      )
    })

    it('should update all fields and preserve ID and budgetId', () => {
      const newType = BudgetItemType.STOCK_ITEM
      const newDescription = 'Filtro de ar'
      const newQuantity = 1
      const newUnitPrice = 'R$ 75,00'
      const newNotes = 'Filtro de alta qualidade'
      const newStockItemId = 'stock_999'

      originalBudgetItem.updateType(newType)
      originalBudgetItem.updateDescription(newDescription)
      originalBudgetItem.updateQuantity(newQuantity)
      originalBudgetItem.updateUnitPrice(newUnitPrice)
      originalBudgetItem.updateNotes(newNotes)
      originalBudgetItem.updateStockItemId(newStockItemId)
      originalBudgetItem.updateServiceId()

      expect(originalBudgetItem.id).toBe('budget_item_123')
      expect(originalBudgetItem.budgetId).toBe(validBudgetId)
      expect(originalBudgetItem.type).toBe(newType)
      expect(originalBudgetItem.description).toBe(newDescription)
      expect(originalBudgetItem.quantity).toBe(newQuantity)
      expect(originalBudgetItem.unitPrice.getReaisValue()).toBe(75)
      expect(originalBudgetItem.notes).toBe(newNotes)
      expect(originalBudgetItem.stockItemId).toBe(newStockItemId)
      expect(originalBudgetItem.serviceId).toBeUndefined()
    })

    it('should recalculate total price when quantity or unit price changes', () => {
      const newQuantity = 3
      const newUnitPrice = 'R$ 200,00'

      originalBudgetItem.updateQuantity(newQuantity)
      originalBudgetItem.updateUnitPrice(newUnitPrice)

      const expectedTotal = Price.create(newUnitPrice).getValue() * newQuantity
      expect(originalBudgetItem.totalPrice.getValue()).toBe(expectedTotal)
    })

    it('should handle optional fields correctly', () => {
      const budgetItemWithoutOptionalFields = new BudgetItem(
        'budget_item_456',
        validType,
        validDescription,
        validQuantity,
        Price.create(validUnitPrice),
        validBudgetId,
      )

      expect(budgetItemWithoutOptionalFields.notes).toBeUndefined()
      expect(budgetItemWithoutOptionalFields.stockItemId).toBeUndefined()
      expect(budgetItemWithoutOptionalFields.serviceId).toBeUndefined()
    })
  })

  describe('getFormattedUnitPrice', () => {
    it('should return formatted unit price', () => {
      const budgetItem = BudgetItem.create(
        validType,
        validDescription,
        validQuantity,
        validUnitPrice,
        validBudgetId,
      )

      expect(budgetItem.unitPrice.getReaisValue()).toBe(150)
      expect(budgetItem.getFormattedUnitPrice()).toContain('150,00')
    })
  })

  describe('getFormattedTotalPrice', () => {
    it('should return formatted total price', () => {
      const budgetItem = BudgetItem.create(
        validType,
        validDescription,
        validQuantity,
        'R$ 100,00',
        validBudgetId,
      )

      expect(budgetItem.totalPrice.getReaisValue()).toBe(200)
      expect(budgetItem.getFormattedTotalPrice()).toContain('200,00')
    })

    it('should calculate total price correctly for different quantities', () => {
      const budgetItem = BudgetItem.create(
        validType,
        validDescription,
        5,
        'R$ 50,00',
        validBudgetId,
      )

      expect(budgetItem.totalPrice.getReaisValue()).toBe(250)
      expect(budgetItem.getFormattedTotalPrice()).toContain('250,00')
    })
  })

  describe('edge cases', () => {
    it('should handle quantity of 1', () => {
      const budgetItem = BudgetItem.create(
        validType,
        validDescription,
        1,
        'R$ 100,00',
        validBudgetId,
      )

      expect(budgetItem.quantity).toBe(1)
      expect(budgetItem.totalPrice.getValue()).toBe(10000) // 100.00 in cents
    })

    it('should handle zero price', () => {
      const budgetItem = BudgetItem.create(
        validType,
        'Serviço gratuito',
        1,
        'R$ 0,00',
        validBudgetId,
      )

      expect(budgetItem.unitPrice.getValue()).toBe(0)
      expect(budgetItem.totalPrice.getValue()).toBe(0)
      expect(budgetItem.totalPrice.getReaisValue()).toBe(0)
      expect(budgetItem.getFormattedTotalPrice()).toContain('0,00')
    })
  })
})

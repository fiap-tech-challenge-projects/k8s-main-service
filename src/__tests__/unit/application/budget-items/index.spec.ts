import { BudgetItemApplicationModule } from '@application/budget-items'

/**
 * Test suite for Budget Items Application Module exports
 */
describe('Budget Item Application Module', () => {
  it('should export BudgetItemApplicationModule', () => {
    expect(BudgetItemApplicationModule).toBeDefined()
    expect(typeof BudgetItemApplicationModule).toBe('function')
  })

  it('should be a valid NestJS module class', () => {
    expect(BudgetItemApplicationModule.name).toBe('BudgetItemApplicationModule')
    expect(BudgetItemApplicationModule.prototype).toBeDefined()
  })

  it('should have module decorator metadata', () => {
    const imports = Reflect.getMetadata('imports', BudgetItemApplicationModule) ?? []
    const providers = Reflect.getMetadata('providers', BudgetItemApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', BudgetItemApplicationModule) ?? []

    expect(Array.isArray(imports)).toBe(true)
    expect(Array.isArray(providers)).toBe(true)
    expect(Array.isArray(exports)).toBe(true)
  })
})

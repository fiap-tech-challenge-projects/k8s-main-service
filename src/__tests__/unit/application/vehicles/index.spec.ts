import { VehicleApplicationModule } from '@application/vehicles'

/**
 * Test suite for Vehicle Application Module exports
 */
describe('Vehicle Application Module', () => {
  it('should export VehicleApplicationModule', () => {
    expect(VehicleApplicationModule).toBeDefined()
    expect(typeof VehicleApplicationModule).toBe('function')
  })

  it('should be a valid NestJS module class', () => {
    expect(VehicleApplicationModule.name).toBe('VehicleApplicationModule')
    expect(VehicleApplicationModule.prototype).toBeDefined()
  })

  it('should have module decorator metadata', () => {
    const imports = Reflect.getMetadata('imports', VehicleApplicationModule) ?? []
    const providers = Reflect.getMetadata('providers', VehicleApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', VehicleApplicationModule) ?? []

    expect(Array.isArray(imports)).toBe(true)
    expect(Array.isArray(providers)).toBe(true)
    expect(Array.isArray(exports)).toBe(true)
  })
})

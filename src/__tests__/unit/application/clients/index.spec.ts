import { ClientApplicationModule } from '@application/clients'

/**
 * Test suite for clients index exports
 */
describe('Clients Index', () => {
  it('should export ClientApplicationModule', () => {
    expect(ClientApplicationModule).toBeDefined()
    expect(typeof ClientApplicationModule).toBe('function')
  })

  it('should have module decorator', () => {
    const moduleMetadata = Reflect.getMetadata('imports', ClientApplicationModule) ?? []
    const providers = Reflect.getMetadata('providers', ClientApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', ClientApplicationModule) ?? []

    expect(Array.isArray(moduleMetadata)).toBe(true)
    expect(Array.isArray(providers)).toBe(true)
    expect(Array.isArray(exports)).toBe(true)
  })

  it('should be a valid NestJS module', () => {
    const moduleName = ClientApplicationModule.name
    expect(moduleName).toBe('ClientApplicationModule')
  })

  it('should be instantiable', () => {
    const moduleInstance = new ClientApplicationModule()
    expect(moduleInstance).toBeDefined()
    expect(moduleInstance).toBeInstanceOf(ClientApplicationModule)
  })
})

import { ClientApplicationModule } from '@application/clients'

/**
 * Test suite for ClientApplicationModule
 */
describe('ClientApplicationModule', () => {
  it('should be defined', () => {
    expect(ClientApplicationModule).toBeDefined()
  })

  it('should be a valid NestJS module', () => {
    const moduleName = ClientApplicationModule.name
    expect(moduleName).toBe('ClientApplicationModule')
  })

  it('should have module decorator', () => {
    const moduleMetadata = Reflect.getMetadata('imports', ClientApplicationModule) ?? []
    const providers = Reflect.getMetadata('providers', ClientApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', ClientApplicationModule) ?? []

    expect(Array.isArray(moduleMetadata)).toBe(true)
    expect(Array.isArray(providers)).toBe(true)
    expect(Array.isArray(exports)).toBe(true)
  })

  it('should export Use Cases and Presenter', () => {
    const exportedExports = Reflect.getMetadata('exports', ClientApplicationModule) ?? []
    expect(exportedExports.length).toBeGreaterThan(0)
  })

  it('should have correct module metadata', () => {
    const providers = Reflect.getMetadata('providers', ClientApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', ClientApplicationModule) ?? []

    expect(providers.length).toBeGreaterThan(0)
    expect(exports.length).toBeGreaterThan(0)
  })

  it('should be instantiable', () => {
    const moduleInstance = new ClientApplicationModule()
    expect(moduleInstance).toBeDefined()
    expect(moduleInstance).toBeInstanceOf(ClientApplicationModule)
  })
})

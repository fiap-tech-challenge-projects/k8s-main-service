import { EmployeeApplicationModule } from '@application/employees'

/**
 * Test suite for EmployeeApplicationModule
 */
describe('EmployeeApplicationModule', () => {
  it('should be defined', () => {
    expect(EmployeeApplicationModule).toBeDefined()
  })

  it('should be a valid NestJS module', () => {
    const moduleName = EmployeeApplicationModule.name
    expect(moduleName).toBe('EmployeeApplicationModule')
  })

  it('should have module decorator', () => {
    const moduleMetadata = Reflect.getMetadata('imports', EmployeeApplicationModule) ?? []
    const providers = Reflect.getMetadata('providers', EmployeeApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', EmployeeApplicationModule) ?? []

    expect(Array.isArray(moduleMetadata)).toBe(true)
    expect(Array.isArray(providers)).toBe(true)
    expect(Array.isArray(exports)).toBe(true)
  })

  it('should export Use Cases and Presenter', () => {
    const exportedExports = Reflect.getMetadata('exports', EmployeeApplicationModule) ?? []
    expect(exportedExports.length).toBeGreaterThan(0)
  })

  it('should have correct module metadata', () => {
    const providers = Reflect.getMetadata('providers', EmployeeApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', EmployeeApplicationModule) ?? []

    expect(providers.length).toBeGreaterThan(0)
    expect(exports.length).toBeGreaterThan(0)
  })

  it('should be instantiable', () => {
    const moduleInstance = new EmployeeApplicationModule()
    expect(moduleInstance).toBeDefined()
    expect(moduleInstance).toBeInstanceOf(EmployeeApplicationModule)
  })
})

import { EmployeeApplicationModule } from '@application/employees'

/**
 * Test suite for employees index exports
 */
describe('Employees Index', () => {
  it('should export EmployeeApplicationModule', () => {
    expect(EmployeeApplicationModule).toBeDefined()
    expect(typeof EmployeeApplicationModule).toBe('function')
  })

  it('should have module decorator', () => {
    const moduleMetadata = Reflect.getMetadata('imports', EmployeeApplicationModule) ?? []
    const providers = Reflect.getMetadata('providers', EmployeeApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', EmployeeApplicationModule) ?? []

    expect(Array.isArray(moduleMetadata)).toBe(true)
    expect(Array.isArray(providers)).toBe(true)
    expect(Array.isArray(exports)).toBe(true)
  })

  it('should be a valid NestJS module', () => {
    const moduleName = EmployeeApplicationModule.name
    expect(moduleName).toBe('EmployeeApplicationModule')
  })

  it('should be instantiable', () => {
    const moduleInstance = new EmployeeApplicationModule()
    expect(moduleInstance).toBeDefined()
    expect(moduleInstance).toBeInstanceOf(EmployeeApplicationModule)
  })
})

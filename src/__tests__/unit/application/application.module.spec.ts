import { ApplicationModule } from '@application/application.module'
import { ClientApplicationModule } from '@application/clients'
import { EmployeeApplicationModule } from '@application/employees'
import { ServiceApplicationModule } from '@application/services'
import { StockApplicationModule } from '@application/stock'
import { VehicleApplicationModule } from '@application/vehicles'

/**
 * Test suite for ApplicationModule
 */
describe('ApplicationModule', () => {
  it('should be defined', () => {
    expect(ApplicationModule).toBeDefined()
  })

  it('should be a valid NestJS module', () => {
    const moduleName = ApplicationModule.name
    expect(moduleName).toBe('ApplicationModule')
  })

  it('should have module decorator', () => {
    const moduleMetadata = Reflect.getMetadata('imports', ApplicationModule) ?? []
    const providers = Reflect.getMetadata('providers', ApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', ApplicationModule) ?? []

    expect(Array.isArray(moduleMetadata)).toBe(true)
    expect(Array.isArray(providers)).toBe(true)
    expect(Array.isArray(exports)).toBe(true)
  })

  it('should import required modules', () => {
    const moduleMetadata = Reflect.getMetadata('imports', ApplicationModule) ?? []

    expect(moduleMetadata).toContain(ClientApplicationModule)
    expect(moduleMetadata).toContain(EmployeeApplicationModule)
    expect(moduleMetadata).toContain(VehicleApplicationModule)
    expect(moduleMetadata).toContain(ServiceApplicationModule)
    expect(moduleMetadata).toContain(StockApplicationModule)
  })

  it('should export all imported modules', () => {
    const exportedModules = Reflect.getMetadata('exports', ApplicationModule) ?? []

    expect(exportedModules).toContain(ClientApplicationModule)
    expect(exportedModules).toContain(EmployeeApplicationModule)
    expect(exportedModules).toContain(VehicleApplicationModule)
    expect(exportedModules).toContain(ServiceApplicationModule)
    expect(exportedModules).toContain(StockApplicationModule)
  })

  it('should have correct module metadata', () => {
    const moduleMetadata = Reflect.getMetadata('imports', ApplicationModule) ?? []
    const providers = Reflect.getMetadata('providers', ApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', ApplicationModule) ?? []

    expect(moduleMetadata).toContain(ClientApplicationModule)
    expect(moduleMetadata).toContain(EmployeeApplicationModule)
    expect(moduleMetadata).toContain(VehicleApplicationModule)
    expect(moduleMetadata).toContain(ServiceApplicationModule)
    expect(moduleMetadata).toContain(StockApplicationModule)
    expect(providers).toHaveLength(0)
    expect(exports).toContain(ClientApplicationModule)
    expect(exports).toContain(EmployeeApplicationModule)
    expect(exports).toContain(VehicleApplicationModule)
    expect(exports).toContain(ServiceApplicationModule)
    expect(exports).toContain(StockApplicationModule)
  })

  it('should be instantiable', () => {
    const moduleInstance = new ApplicationModule()
    expect(moduleInstance).toBeDefined()
    expect(moduleInstance).toBeInstanceOf(ApplicationModule)
  })

  it('should have correct module structure', () => {
    const imports = Reflect.getMetadata('imports', ApplicationModule) ?? []
    const exports = Reflect.getMetadata('exports', ApplicationModule) ?? []

    expect(imports).toHaveLength(11)
    expect(exports).toHaveLength(10)
  })
})

process.env.NODE_ENV = 'development'
process.env.PORT = '3000'

import { InfraModule } from '@infra/infra.module'

describe('InfraModule', () => {
  it('should be defined', () => {
    expect(InfraModule).toBeDefined()
  })

  it('should be a valid module class', () => {
    expect(typeof InfraModule).toBe('function')
    expect(InfraModule.name).toBe('InfraModule')
  })
})

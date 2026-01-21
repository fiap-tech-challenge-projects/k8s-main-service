process.env.NODE_ENV = 'development'
process.env.PORT = '3000'

import { DatabaseModule } from '@infra/database/database.module'

describe('DatabaseModule', () => {
  it('should be defined', () => {
    expect(DatabaseModule).toBeDefined()
  })

  it('should be a valid module class', () => {
    expect(typeof DatabaseModule).toBe('function')
    expect(DatabaseModule.name).toBe('DatabaseModule')
  })
})

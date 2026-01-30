import { PrismaModule } from '@infra/database/prisma/prisma.module'

describe('PrismaModule', () => {
  it('should be defined', () => {
    expect(PrismaModule).toBeDefined()
  })

  it('should be a valid module class', () => {
    expect(typeof PrismaModule).toBe('function')
    expect(PrismaModule.name).toBe('PrismaModule')
  })
})

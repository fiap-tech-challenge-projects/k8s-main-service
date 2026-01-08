import { Test, TestingModule } from '@nestjs/testing'

import { WelcomeController } from '@interfaces/rest/controllers'

describe('WelcomeController', () => {
  let controller: WelcomeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WelcomeController],
    }).compile()

    controller = module.get<WelcomeController>(WelcomeController)
  })

  describe('getWelcome', () => {
    it('should return welcome information object', () => {
      const result = controller.getWelcome()
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('version')
      expect(result).toHaveProperty('endpoints')
    })

    it('should set default environment when NODE_ENV is undefined', () => {
      const originalEnv = process.env.NODE_ENV
      delete process.env.NODE_ENV
      const result = controller.getWelcome()
      expect(result).toHaveProperty('environment', 'development')
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth()
      expect(result).toHaveProperty('status', 'healthy')
      expect(result).toHaveProperty('uptime')
      expect(result).toHaveProperty('environment')
    })

    it('should return default environment when NODE_ENV is undefined', () => {
      const originalEnv = process.env.NODE_ENV
      delete process.env.NODE_ENV
      const result = controller.getHealth()
      expect(result).toHaveProperty('environment', 'development')
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('getInfo', () => {
    it('should return API information', () => {
      const result = controller.getInfo()
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('version')
      expect(result).toHaveProperty('documentation')
    })

    it('should include default environment when NODE_ENV is undefined', () => {
      const originalEnv = process.env.NODE_ENV
      delete process.env.NODE_ENV
      const result = controller.getInfo()
      expect(result).toHaveProperty('environment', 'development')
      process.env.NODE_ENV = originalEnv
    })
  })
})

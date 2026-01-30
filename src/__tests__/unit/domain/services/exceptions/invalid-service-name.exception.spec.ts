import { InvalidServiceNameException } from '@domain/services/exceptions'

describe('InvalidServiceNameException', () => {
  it('has default message and name', () => {
    const ex = new InvalidServiceNameException()
    expect(ex.message).toMatch(/Invalid service name/)
    expect(ex.name).toBe('InvalidServiceNameException')
  })
})

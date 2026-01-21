import { InvalidServiceDescriptionException } from '@domain/services/exceptions'

describe('InvalidServiceDescriptionException', () => {
  it('uses default message and sets name', () => {
    const ex = new InvalidServiceDescriptionException()
    expect(ex.message).toMatch(/Invalid service description/)
    expect(ex.name).toBe('InvalidServiceDescriptionException')
  })

  it('allows custom message', () => {
    const ex = new InvalidServiceDescriptionException('too short')
    expect(ex.message).toBe('too short')
  })
})

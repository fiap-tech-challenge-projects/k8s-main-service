import { AlreadyExistsException } from '@shared/exceptions'

describe('AlreadyExistsException', () => {
  it('builds a helpful message and sets the name', () => {
    const ex = new AlreadyExistsException('Service', 'name', 'oil-change')

    expect(ex).toBeInstanceOf(Error)
    expect(ex.message).toBe("Service with name 'oil-change' already exists")
    expect(ex.name).toBe('AlreadyExistsException')
  })
})

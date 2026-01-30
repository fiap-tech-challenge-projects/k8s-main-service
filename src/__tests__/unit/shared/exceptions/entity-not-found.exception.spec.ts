import { EntityNotFoundException } from '@shared/exceptions'

describe('EntityNotFoundException', () => {
  it('builds message and sets the class name', () => {
    const err = new EntityNotFoundException('User', 'id-1')
    expect(err.message).toBe("User with id 'id-1' not found")
    expect(err.name).toBe('EntityNotFoundException')
  })
})

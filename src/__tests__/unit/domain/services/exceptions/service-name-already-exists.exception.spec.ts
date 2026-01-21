import { ServiceNameAlreadyExistsException } from '@domain/services'
import { AlreadyExistsException } from '@shared'

describe('ServiceNameAlreadyExistsException', () => {
  it('sets a default message when no details provided and extends AlreadyExistsException', () => {
    const ex = new ServiceNameAlreadyExistsException('Oil Change')
    expect(ex).toBeInstanceOf(AlreadyExistsException)
    expect(ex.message).toContain("Service with name 'Oil Change' already exists")
    expect(ex.name).toBe('ServiceNameAlreadyExistsException')
  })

  it('includes details when provided', () => {
    const ex = new ServiceNameAlreadyExistsException('Brake Repair', 'duplicate in db')
    expect(ex.message).toContain("Service with name 'Brake Repair' already exists: duplicate in db")
  })
})

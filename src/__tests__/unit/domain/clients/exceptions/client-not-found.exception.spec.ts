import { ClientNotFoundException } from '@domain/clients/exceptions'
import { EntityNotFoundException } from '@shared'

describe('ClientNotFoundException', () => {
  it('should extend EntityNotFoundException and format message', () => {
    const error = new ClientNotFoundException('client-123')

    expect(error).toBeInstanceOf(ClientNotFoundException)
    expect(error).toBeInstanceOf(EntityNotFoundException)
    expect(error.message).toContain('Client')
    expect(error.message).toContain('client-123')
  })
})

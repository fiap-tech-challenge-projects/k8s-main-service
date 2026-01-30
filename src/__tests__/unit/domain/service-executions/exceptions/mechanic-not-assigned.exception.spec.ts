import { MechanicNotAssignedException } from '@domain/service-executions'

describe('MechanicNotAssignedException', () => {
  it('has default message and name', () => {
    const ex = new MechanicNotAssignedException()
    expect(ex).toBeInstanceOf(Error)
    expect(ex.message).toMatch(/Cannot perform operation without assigned mechanic/)
    expect(ex.name).toBe('MechanicNotAssignedException')
  })

  it('accepts custom message', () => {
    const ex = new MechanicNotAssignedException('custom')
    expect(ex.message).toBe('custom')
  })
})

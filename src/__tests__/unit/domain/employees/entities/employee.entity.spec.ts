import { Employee } from '@domain/employees/entities'
import { Email } from '@shared'

describe('Employee entity (pure unit)', () => {
  const name = 'John Doe'
  const email = 'John.Doe@Example.COM '
  const role = 'mechanic'
  const phone = '123456789'
  const specialty = 'engine'

  it('create sets fields and normalizes email', () => {
    const emp = Employee.create(name, email, role, phone, specialty, true)

    expect(emp.name).toBe(name)
    expect(emp.role).toBe(role)
    expect(emp.phone).toBe(phone)
    expect(emp.specialty).toBe(specialty)
    expect(emp.isActive).toBe(true)
    expect(emp.getNormalizedEmail()).toBe(new Email(email).normalized)
  })

  it('update methods change values and updatedAt', () => {
    const emp = Employee.create(name, email, role)
    const before = emp.updatedAt

    emp.updateName('Jane')
    expect(emp.name).toBe('Jane')
    expect(emp.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())

    emp.updateRole('manager')
    expect(emp.role).toBe('manager')

    emp.updatePhone('999')
    expect(emp.phone).toBe('999')
    emp.updatePhone(undefined)
    expect(emp.phone).toBeUndefined()

    emp.updateSpecialty('brakes')
    expect(emp.specialty).toBe('brakes')
    emp.updateSpecialty(undefined)
    expect(emp.specialty).toBeUndefined()

    emp.updateEmail('new@ex.com')
    expect(emp.getNormalizedEmail()).toBe('new@ex.com')

    emp.updateIsActive(false)
    expect(emp.isActive).toBe(false)
  })

  it('hasPhone and hasSpecialty detect empty strings', () => {
    const emp = Employee.create(name, email, role, '  ', '  ')
    expect(emp.hasPhone()).toBe(false)
    expect(emp.hasSpecialty()).toBe(false)

    emp.updatePhone('55')
    emp.updateSpecialty('s')
    expect(emp.hasPhone()).toBe(true)
    expect(emp.hasSpecialty()).toBe(true)
  })

  it('activate and deactivate toggle isActive', () => {
    const emp = Employee.create(name, email, role, undefined, undefined, false)
    expect(emp.isActive).toBe(false)
    emp.activate()
    expect(emp.isActive).toBe(true)
    emp.deactivate()
    expect(emp.isActive).toBe(false)
  })
})

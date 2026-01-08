import { InvalidEstimatedDurationException } from '@domain/services/exceptions'

describe('InvalidEstimatedDurationException', () => {
  it('should create exception with string value', () => {
    const exception = new InvalidEstimatedDurationException('00:50')

    expect(exception.message).toBe(
      'Invalid estimated duration: "00:50". Expected format: HH:MM:SS (e.g., "00:50:00") or hours as decimal (e.g., 0.83)',
    )
  })

  it('should create exception with number value', () => {
    const exception = new InvalidEstimatedDurationException(-5)

    expect(exception.message).toBe(
      'Invalid estimated duration: "-5". Expected format: HH:MM:SS (e.g., "00:50:00") or hours as decimal (e.g., 0.83)',
    )
  })

  it('should extend DomainException', () => {
    const exception = new InvalidEstimatedDurationException('invalid')

    expect(exception).toBeInstanceOf(Error)
  })
})

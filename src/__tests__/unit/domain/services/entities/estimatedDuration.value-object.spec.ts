import { InvalidEstimatedDurationException } from '@domain/services/exceptions'
import { EstimatedDuration } from '@domain/services/value-objects'

describe('EstimatedDuration', () => {
  it('should create an instance from a valid number (hours)', () => {
    const duration = EstimatedDuration.create(1.5)
    expect(duration.getValue()).toBe(1.5)
    expect(duration.getFormatted()).toBe('01:30:00')
    expect(duration.getMinutes()).toBe(90)
    expect(duration.getSeconds()).toBe(5400)
  })

  it('should create an instance from a valid string in HH:MM:SS format', () => {
    const duration = EstimatedDuration.create('00:50:00')
    expect(duration.getValue()).toBeCloseTo(0.8333, 4)
    expect(duration.getFormatted()).toBe('00:50:00')
    expect(duration.getMinutes()).toBe(50)
    expect(duration.getSeconds()).toBe(3000)
  })

  it('should handle hours, minutes, and seconds correctly', () => {
    const duration = EstimatedDuration.create('02:30:45')
    expect(duration.getValue()).toBeCloseTo(2.5125, 4)
    expect(duration.getFormatted()).toBe('02:30:45')
    expect(duration.getMinutes()).toBe(151)
    expect(duration.getSeconds()).toBe(9045)
  })

  it('should handle decimal hours correctly', () => {
    const duration = EstimatedDuration.create(0.83)
    expect(duration.getValue()).toBe(0.83)
    expect(duration.getFormatted()).toBe('00:49:48')
    expect(duration.getMinutes()).toBe(50)
    expect(duration.getSeconds()).toBe(2988)
  })

  it('should throw InvalidEstimatedDurationException for negative values', () => {
    expect(() => EstimatedDuration.create(-5)).toThrow(InvalidEstimatedDurationException)
  })

  it('should throw InvalidEstimatedDurationException for invalid string format', () => {
    expect(() => EstimatedDuration.create('00:50')).toThrow(InvalidEstimatedDurationException)
    expect(() => EstimatedDuration.create('invalid')).toThrow(InvalidEstimatedDurationException)
  })

  it('should handle zero duration', () => {
    const duration = EstimatedDuration.create(0)
    expect(duration.getValue()).toBe(0)
    expect(duration.getFormatted()).toBe('00:00:00')
    expect(duration.getMinutes()).toBe(0)
    expect(duration.getSeconds()).toBe(0)
  })

  it('should handle zero duration as string', () => {
    const duration = EstimatedDuration.create('00:00:00')
    expect(duration.getValue()).toBe(0)
    expect(duration.getFormatted()).toBe('00:00:00')
    expect(duration.getMinutes()).toBe(0)
    expect(duration.getSeconds()).toBe(0)
  })
})

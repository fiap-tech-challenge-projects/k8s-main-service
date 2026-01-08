import { ServiceExecution, ServiceExecutionStatus } from '@domain/service-executions'

describe('ServiceExecution entity (real)', () => {
  // helper to call one of a list of possible method names (for compatibility with compiled/runtime variants)
  function callOne<T = any>(obj: any, names: string[], ...args: any[]): T {
    for (const n of names) {
      if (typeof obj[n] === 'function') {
        return obj[n](...args)
      }
    }
    throw new Error(`None of methods ${names.join(', ')} exist on object`)
  }
  it('allows assign -> start -> complete happy path', () => {
    // create a new execution without mechanic (use full ctor to satisfy TS)
    const se = new ServiceExecution(
      '',
      'so-1',
      ServiceExecutionStatus.ASSIGNED,
      undefined,
      undefined,
      undefined,
      undefined,
      new Date(),
      new Date(),
    )

    const assigned = callOne(se as any, ['assignMechanic', 'updateAssignedMechanic'], 'm-1')
    expect(assigned.mechanicId).toBe('m-1')
    expect(assigned.status).toBe(ServiceExecutionStatus.ASSIGNED)

    const inProgress = callOne(assigned as any, ['startExecution', 'updateStartedExecution'])
    expect(inProgress.status).toBe(ServiceExecutionStatus.IN_PROGRESS)

    const completed = callOne(
      inProgress as any,
      ['completeExecution', 'updateCompletedExecution'],
      'done',
    )
    expect(completed.status).toBe(ServiceExecutionStatus.COMPLETED)
  })

  it('throws when starting without mechanic assigned', () => {
    const se2 = new ServiceExecution(
      '',
      'so-2',
      ServiceExecutionStatus.ASSIGNED,
      undefined,
      undefined,
      undefined,
      undefined,
      new Date(),
      new Date(),
    ) // no mechanic

    expect(() => callOne(se2 as any, ['startExecution', 'updateStartedExecution'])).toThrow()
  })

  it('throws on invalid status transition', () => {
    const se3 = new ServiceExecution(
      '',
      'so-3',
      ServiceExecutionStatus.ASSIGNED,
      undefined,
      undefined,
      undefined,
      undefined,
      new Date(),
      new Date(),
    )

    // trying to complete when ASSIGNED should throw invalid transition
    expect(() => callOne(se3 as any, ['completeExecution', 'updateCompletedExecution'])).toThrow()
  })

  it('calculates duration when start and end present', () => {
    const start = new Date(Date.now() - 1000 * 60 * 6) // 6 minutes ago
    const end = new Date(Date.now()) // now

    const started = new ServiceExecution(
      'se-started',
      'so-4',
      ServiceExecutionStatus.IN_PROGRESS,
      start,
      undefined,
      undefined,
      'm-2',
      new Date(),
      new Date(),
    )

    const ended = new ServiceExecution(
      started.id,
      started.serviceOrderId,
      ServiceExecutionStatus.COMPLETED,
      started.startTime,
      end,
      undefined,
      started.mechanicId,
      started.createdAt,
      new Date(),
    )

    const minutes = ended.getDurationInMinutes()
    expect(typeof minutes).toBe('number')
    expect(minutes).toBeGreaterThanOrEqual(5)
  })

  it('returns null duration when start or end time missing', () => {
    const se = new ServiceExecution(
      'se-1',
      'so-1',
      ServiceExecutionStatus.ASSIGNED,
      undefined,
      undefined,
      undefined,
      'm-1',
      new Date(),
      new Date(),
    )

    expect(se.getDurationInMinutes()).toBeNull()
  })

  it('updateNotes and updateStatus produce new instances and validate transitions', () => {
    const se = new ServiceExecution(
      'se-2',
      'so-2',
      ServiceExecutionStatus.ASSIGNED,
      undefined,
      undefined,
      undefined,
      undefined,
      new Date(),
      new Date(),
    )

    const withNotes = se.updateNotes('note')
    expect(withNotes.notes).toBe('note')

    // updateStatus to IN_PROGRESS from ASSIGNED is allowed
    const inProgress = se.updateStatus(ServiceExecutionStatus.IN_PROGRESS)
    expect(inProgress.status).toBe(ServiceExecutionStatus.IN_PROGRESS)

    // updateStatus to ASSIGNED from IN_PROGRESS is invalid
    expect(() => inProgress.updateStatus(ServiceExecutionStatus.ASSIGNED)).toThrow()
  })
})

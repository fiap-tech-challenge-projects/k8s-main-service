import { DeleteEmployeeUseCase } from '@application/employees'

describe('DeleteEmployeeUseCase', () => {
  it('returns Success when employee does not exist (idempotent)', async () => {
    const mockRepo = { findById: jest.fn().mockResolvedValue(null) }
    const mockUserContext = { getUserId: () => 'u-1' }
    const useCase = new DeleteEmployeeUseCase(mockRepo as any, mockUserContext as any)

    const res = await useCase.execute('e-1')

    expect(res.isSuccess).toBe(true)
  })

  it('returns Success when delete succeeds', async () => {
    const mockRepo = {
      findById: jest.fn().mockResolvedValue({ id: 'e-1' }),
      delete: jest.fn().mockResolvedValue(true),
    }
    const mockUserContext = { getUserId: () => 'u-1' }
    const useCase = new DeleteEmployeeUseCase(mockRepo as any, mockUserContext as any)

    const res = await useCase.execute('e-1')

    expect(res.isSuccess).toBe(true)
  })

  it('returns Failure when repository throws', async () => {
    const mockRepo = { findById: jest.fn().mockRejectedValue(new Error('db')) }
    const mockUserContext = { getUserId: () => 'u-1' }
    const useCase = new DeleteEmployeeUseCase(mockRepo as any, mockUserContext as any)

    const res = await useCase.execute('e-1')

    expect(res.isFailure).toBe(true)
  })
})

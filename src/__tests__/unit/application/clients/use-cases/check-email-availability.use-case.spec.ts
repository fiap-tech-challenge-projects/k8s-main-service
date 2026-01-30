import { CheckEmailAvailabilityUseCase } from '@application/clients/use-cases'

describe('CheckEmailAvailabilityUseCase', () => {
  it('returns Success(true) when email not exists', async () => {
    const mockRepo = { emailExists: jest.fn().mockResolvedValue(false) }
    const mockUserCtx = { getUserId: jest.fn().mockReturnValue('u1') }

    const uc = new CheckEmailAvailabilityUseCase(mockRepo as any, mockUserCtx as any)

    const result = await uc.execute('a@b.c')

    expect(result.isSuccess).toBeTruthy()
    if (result.isSuccess) expect(result.value).toBe(true)
  })

  it('returns Failure when repository throws', async () => {
    const mockRepo = { emailExists: jest.fn().mockRejectedValue(new Error('db')) }
    const mockUserCtx = { getUserId: jest.fn().mockReturnValue('u1') }

    const uc = new CheckEmailAvailabilityUseCase(mockRepo as any, mockUserCtx as any)

    const result = await uc.execute('a@b.c')

    expect(result.isFailure).toBeTruthy()
  })
})

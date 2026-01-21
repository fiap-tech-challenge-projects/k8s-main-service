import { SendTemplatedEmailUseCase } from '@application/email/use-cases'

describe('SendTemplatedEmailUseCase', () => {
  it('returns SUCCESS when emailService.sendTemplatedEmail resolves', async () => {
    const mockEmailService = { sendTemplatedEmail: jest.fn().mockResolvedValue(undefined) }
    const uc = new SendTemplatedEmailUseCase(mockEmailService as any)

    const result = await uc.execute({ to: 'a@b.c', template: 't' } as any)

    expect(result.isSuccess).toBeTruthy()
    expect(mockEmailService.sendTemplatedEmail).toHaveBeenCalledWith('a@b.c', 't')
  })

  it('returns FAILURE when emailService.sendTemplatedEmail throws', async () => {
    const err = new Error('smtp')
    const mockEmailService = { sendTemplatedEmail: jest.fn().mockRejectedValue(err) }
    const uc = new SendTemplatedEmailUseCase(mockEmailService as any)

    const result = await uc.execute({ to: 'a@b.c', template: 't' } as any)

    expect(result.isFailure).toBeTruthy()
  })
})

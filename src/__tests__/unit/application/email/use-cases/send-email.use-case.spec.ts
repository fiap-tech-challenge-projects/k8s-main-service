import { SendEmailUseCase } from '@application/email/use-cases'

describe('SendEmailUseCase', () => {
  it('returns SUCCESS when emailService.sendEmail resolves', async () => {
    const mockEmailService = { sendEmail: jest.fn().mockResolvedValue(undefined) }
    const uc = new SendEmailUseCase(mockEmailService as any)

    const result = await uc.execute({ to: 'a@b.c', subject: 'hi', content: 'x' })

    expect(result.isSuccess).toBeTruthy()
    expect(mockEmailService.sendEmail).toHaveBeenCalled()
  })

  it('returns FAILURE when emailService.sendEmail throws', async () => {
    const err = new Error('smtp')
    const mockEmailService = { sendEmail: jest.fn().mockRejectedValue(err) }
    const uc = new SendEmailUseCase(mockEmailService as any)

    const result = await uc.execute({ to: 'a@b.c', subject: 'hi', content: 'x' })

    expect(result.isFailure).toBeTruthy()
    // runtime check for failure payload
    if (result.isFailure) {
      expect((result as any).error).toBeDefined()
    }
  })
})

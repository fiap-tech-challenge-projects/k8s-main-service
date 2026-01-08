import { EmailService } from '@infra/email/email.service'

describe('EmailService', () => {
  let service: EmailService

  beforeEach(() => {
    service = new EmailService()
  })

  it('sendEmail resolves without error', async () => {
    await expect(service.sendEmail('a@b.com', 'sub', 'content')).resolves.toBeUndefined()
  })

  it('sendTemplatedEmail throws when template generator not implemented', async () => {
    await expect(service.sendTemplatedEmail('a@b.com', 'unknown')).rejects.toThrow(
      "Email template 'unknown' not implemented",
    )
  })
})

import { EmailResponseDto } from '@application/email/dto'
import { EmailPresenter } from '@application/email/presenters'

describe('EmailPresenter', () => {
  it('formats EmailResponseDto into EmailHttpResponse and preserves timestamp format', () => {
    const presenter = new EmailPresenter()

    const dto: EmailResponseDto = {
      success: true,
      message: 'Sent',
      timestamp: new Date('2020-01-01T00:00:00.000Z'),
    }

    const result = presenter.present(dto)

    expect(result).toEqual({
      success: true,
      message: 'Sent',
      timestamp: '2020-01-01T00:00:00.000Z',
    })
  })
})

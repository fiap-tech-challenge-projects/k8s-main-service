import { BudgetEmailService } from '@application/event-handlers/budget'

describe('BudgetEmailService (unit)', () => {
  let mockEmailService: any
  let svc: BudgetEmailService

  const client = { id: 'c1', name: 'Alice', email: 'alice@example.com' } as any

  beforeEach(() => {
    mockEmailService = { sendEmail: jest.fn().mockResolvedValue(undefined) }
    svc = new BudgetEmailService(mockEmailService)
  })

  afterEach(() => jest.clearAllMocks())

  it('sends budget for approval with correct subject and content', async () => {
    await svc.sendBudgetToClient(client, 'b-1', 'R$100,00', 7)

    expect(mockEmailService.sendEmail).toHaveBeenCalled()
    const [to, subject, content] = mockEmailService.sendEmail.mock.calls[0]
    expect(to).toBe(client.email)
    expect(subject).toContain('Budget for Your Approval')
    expect(content).toContain('Budget for Your Approval')
    expect(content).toContain('Dear Alice')
    expect(content).toContain('<strong>Budget ID:</strong> b-1')
    expect(content).toContain('R$100,00')
  })

  it('sends approval notification with approved template', async () => {
    await svc.sendBudgetApprovalNotification(client, 'b-2', 'R$200,00')

    expect(mockEmailService.sendEmail).toHaveBeenCalled()
    const [, subject, content] = mockEmailService.sendEmail.mock.calls[0]
    expect(subject).toContain('Budget Approval')
    expect(content).toContain('Budget Approved!')
    expect(content).toContain('b-2')
    expect(content).toContain('R$200,00')
  })

  it('sends rejection notification with and without reason', async () => {
    await svc.sendBudgetRejectionNotification(client, 'b-3', 'R$50,00')
    expect(mockEmailService.sendEmail).toHaveBeenCalled()
    let [, , content] = mockEmailService.sendEmail.mock.calls[0]
    expect(content).toContain('We regret to inform you')
    expect(content).not.toContain('<strong>Reason:</strong>')

    mockEmailService.sendEmail.mockClear()
    await svc.sendBudgetRejectionNotification(client, 'b-3', 'R$50,00', 'Out of stock')
    expect(mockEmailService.sendEmail).toHaveBeenCalled()
    ;[, , content] = mockEmailService.sendEmail.mock.calls[0]
    expect(content).toContain('<strong>Reason:</strong> Out of stock')
  })
})

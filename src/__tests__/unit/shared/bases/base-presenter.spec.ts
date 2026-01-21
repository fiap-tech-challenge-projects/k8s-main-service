import { BasePresenter } from '@shared/bases'

class PassthroughPresenter extends BasePresenter<any, any> {
  present(data: any) {
    return { val: data }
  }
}

describe('BasePresenter', () => {
  it('presentPaginated maps items using present', () => {
    const p = new PassthroughPresenter()
    const out = p.presentPaginated({ data: [1, 2, 3], meta: { page: 1 } })
    expect(out.meta).toEqual({ page: 1 })
    expect(out.data).toEqual([{ val: 1 }, { val: 2 }, { val: 3 }])
  })

  it('presentError returns message and timestamp', () => {
    const p = new PassthroughPresenter()
    const err = new Error('boom')
    const out = p.presentError(err)
    expect(out).toHaveProperty('message', 'boom')
    expect(new Date(out.timestamp).toString()).not.toBe('Invalid Date')
  })
})

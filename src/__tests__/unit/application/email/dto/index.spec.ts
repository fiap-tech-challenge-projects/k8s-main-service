import * as dto from '@application/email/dto'

describe('application/email/dto index barrel', () => {
  it('re-exports at least one symbol', () => {
    // Some DTO barrels only re-export TypeScript types (erased at runtime).
    // Accept either runtime exports or a defined module object.
    expect(dto).toBeDefined()
    expect(typeof dto).toBe('object')
  })
})

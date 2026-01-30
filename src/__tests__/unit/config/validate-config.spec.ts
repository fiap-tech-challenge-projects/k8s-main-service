import { IsString } from 'class-validator'

import { validateConfig } from '@config/validate-config'

class Schema {
  @IsString()
  requiredField!: string
}

describe('validateConfig', () => {
  it('returns a validated object when schema is satisfied', () => {
    const cfg = { requiredField: 'ok' }
    const res = validateConfig(cfg, Schema)
    expect(res.requiredField).toBe('ok')
  })

  it('throws when schema validation fails', () => {
    expect(() => validateConfig({}, Schema)).toThrow()
  })
})

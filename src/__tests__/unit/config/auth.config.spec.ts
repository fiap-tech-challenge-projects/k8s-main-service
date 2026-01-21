import authConfig, { AUTH_CONFIG_SCHEMA } from '@config/auth.config'

describe('auth.config', () => {
  it('validates default config and schema accepts defaults', () => {
    // call the register function to get default values (module uses process.env fallbacks)
    const cfg = authConfig()
    expect(cfg.jwtSecret).toBeDefined()
    expect(cfg.bcryptRounds).toBeGreaterThanOrEqual(10)

    // ensure schema accepts a minimal valid object
    const parsed = AUTH_CONFIG_SCHEMA.safeParse({ jwtSecret: 'x'.repeat(32), bcryptRounds: 12 })
    expect(parsed.success).toBe(true)
  })
})

import databaseConfig from '@config/database.config'

describe('database.config', () => {
  const ORIGINAL_ENV = process.env

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('returns databaseUrl config by default (non-test env)', () => {
    delete process.env.NODE_ENV
    delete process.env.DATABASE_URL
    delete process.env.TEST_DATABASE_URL

    const cfg = databaseConfig()
    expect(cfg).toHaveProperty('databaseUrl')
    expect(typeof cfg.databaseUrl).toBe('string')
    expect(cfg.databaseUrl).toContain('postgresql://')
    // default should point to non-test port 5432
    expect(cfg.databaseUrl).toContain(':5432')
  })

  it('returns test databaseUrl when NODE_ENV is test and TEST_DATABASE_URL is unset', () => {
    process.env.NODE_ENV = 'test'
    delete process.env.TEST_DATABASE_URL
    delete process.env.DATABASE_URL

    const cfg = databaseConfig()
    expect(cfg.databaseUrl).toContain(':5433')
    expect(cfg.databaseUrl).toContain('fiap-tech-challenge-test')
  })

  it('prefers TEST_DATABASE_URL when NODE_ENV is test and env var is set', () => {
    process.env.NODE_ENV = 'test'
    process.env.TEST_DATABASE_URL = 'postgresql://x:y@host:1234/test-db?schema=public'

    const cfg = databaseConfig()
    expect(cfg.databaseUrl).toBe(process.env.TEST_DATABASE_URL)
  })

  it('prefers DATABASE_URL when NODE_ENV is not test and env var is set', () => {
    process.env.NODE_ENV = 'development'
    process.env.DATABASE_URL = 'postgresql://u:p@host:9999/prod-db?schema=public'

    const cfg = databaseConfig()
    expect(cfg.databaseUrl).toBe(process.env.DATABASE_URL)
  })
})

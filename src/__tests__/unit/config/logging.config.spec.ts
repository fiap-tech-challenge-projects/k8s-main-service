import * as fs from 'fs'

describe('logging.config', () => {
  const OLD = process.env

  afterEach(() => {
    jest.restoreAllMocks()
    process.env = { ...OLD }
    jest.resetModules()
  })

  it('exports LOGGING_CONFIG with pinoHttp defaults', async () => {
    const { LOGGING_CONFIG } = await import('@config/logging.config')
    expect(LOGGING_CONFIG).toHaveProperty('pinoHttp')
    expect(LOGGING_CONFIG.pinoHttp).toHaveProperty('level')
  })

  it('CREATE_LOGGER extends config with name', async () => {
    const { CREATE_LOGGER } = await import('@config/logging.config')
    const named = CREATE_LOGGER('ServiceX')
    expect((named as any).name).toBe('ServiceX')
    expect(named).toHaveProperty('pinoHttp')
  })

  it('when LOG_TO_FILE=true and createWriteStream throws, stream is undefined (no fs writes)', async () => {
    process.env.LOG_TO_FILE = 'true'
    process.env.LOG_FILE_PATH = '/nonexistent_dir/log.log'

    jest.spyOn(fs, 'existsSync').mockReturnValue(false)
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined as any)
    jest.spyOn(fs, 'createWriteStream').mockImplementation((): any => {
      throw new Error('disk error')
    })
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const { LOGGING_CONFIG } = await import('@config/logging.config')
    expect(LOGGING_CONFIG.pinoHttp.stream).toBeUndefined()
  })
})

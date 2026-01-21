import { setupLoggerMock, clearLoggerMocks } from './mock-logger'
import { silenceNestJSLogs } from './silence-logs'

// Silence NestJS console output for unit tests
silenceNestJSLogs()

// Setup a mocked Nest Logger prototype so tests don't produce real logs
setupLoggerMock()

// After each test clear call history (but keep mocks installed)
afterEach(() => {
  clearLoggerMocks()
})

export {}

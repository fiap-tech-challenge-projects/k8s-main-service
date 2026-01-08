// Silences NestJS logs in tests
const originalConsoleError = console.error
const originalConsoleLog = console.log
const originalConsoleWarn = console.warn

const originalStdoutWrite = process.stdout.write.bind(process.stdout)
const originalStderrWrite = process.stderr.write.bind(process.stderr)

export const silenceNestJSLogs = () => {
  const nestJSLogInterceptor = (method: (...args: unknown[]) => void, args: unknown[]) => {
    // If any console argument contains the NestJS marker we skip printing.
    try {
      const containsNest = args.some((a) => {
        if (typeof a === 'string') return a.includes('[Nest]')
        try {
          return JSON.stringify(a).includes('[Nest]')
        } catch {
          return String(a).includes('[Nest]')
        }
      })

      if (containsNest) return
    } catch {
      // fallback: if something goes wrong, avoid blocking tests; print normally
    }

    method(...(args as []))
  }

  console.error = (...args: unknown[]) => nestJSLogInterceptor(originalConsoleError, args)
  console.log = (...args: unknown[]) => nestJSLogInterceptor(originalConsoleLog, args)
  console.warn = (...args: unknown[]) => nestJSLogInterceptor(originalConsoleWarn, args)

  // Also intercept stdout/stderr writes: Nest may add its own prefix when writing directly.
  const nestChunkFilter = (chunk: any) => {
    try {
      const text = typeof chunk === 'string' ? chunk : chunk.toString()
      if (text && text.includes('[Nest]')) return true
    } catch {
      // ignore
    }
    return false
  }

  // replace write functions to filter Nest output

  ;(process.stdout.write as any) = (chunk: any, ...rest: any[]) => {
    if (nestChunkFilter(chunk)) return true
    return originalStdoutWrite(chunk, ...rest)
  }
  ;(process.stderr.write as any) = (chunk: any, ...rest: any[]) => {
    if (nestChunkFilter(chunk)) return true
    return originalStderrWrite(chunk, ...rest)
  }
}

export const restoreConsole = () => {
  console.error = originalConsoleError
  console.log = originalConsoleLog
  console.warn = originalConsoleWarn
  process.stdout.write = originalStdoutWrite
  process.stderr.write = originalStderrWrite
}

export default silenceNestJSLogs

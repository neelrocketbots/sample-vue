/**
 * Global teardown: convert V8 coverage → Istanbul format and generate reports.
 * Only active when COVERAGE=true.
 *
 * Usage:
 *   COVERAGE=true npx playwright test --project=local
 *
 * Output:
 *   coverage/index.html             – interactive HTML report
 *   coverage/coverage-summary.json  – machine-readable per-file summary
 *   stdout                          – text-summary table
 */
import process from 'node:process'
import * as fs from 'fs'
import * as path from 'path'

const APP_ROOT = process.cwd()
const NYC_OUTPUT_DIR = path.join(APP_ROOT, '.nyc_output')
const COVERAGE_DIR = path.join(APP_ROOT, 'coverage')

const globalTeardown = async () => {
  if (process.env.COVERAGE !== 'true') {
    return
  }

  if (!fs.existsSync(NYC_OUTPUT_DIR)) {
    console.log('[coverage] No .nyc_output directory found — skipping.')
    return
  }

  const files = fs.readdirSync(NYC_OUTPUT_DIR).filter((f) => f.endsWith('.json'))

  if (files.length === 0) {
    console.log('[coverage] No coverage files found in .nyc_output/ — skipping.')
    return
  }

  console.log(`[coverage] Processing ${files.length} coverage file(s)…`)

  const { default: v8ToIstanbul } = await import('v8-to-istanbul')
  const { default: libCoverage } = await import('istanbul-lib-coverage')
  const { default: libReport } = await import('istanbul-lib-report')
  const { default: reports } = await import('istanbul-reports')

  const coverageMap = libCoverage.createCoverageMap({})

  const removeDomainFromURL = (url) => {
    return url.replace(/https?:\/\/.*?\//, '/')
  }
  const hasQueryParams = (url) => {
    return url.includes('?')
  }

  for (const file of files) {
    const v8Coverage = JSON.parse(fs.readFileSync(path.join(NYC_OUTPUT_DIR, file), 'utf8'))

    for (const entry of v8Coverage) {
      if (entry.url.includes('node_modules')) {
        continue
      }

      try {
        const converter = v8ToIstanbul(path.join(APP_ROOT, removeDomainFromURL(entry.url)), 0, {
          source: entry.source,
        })
        await converter.load()
        converter.applyCoverage(entry.functions)
        coverageMap.merge(converter.toIstanbul())
      } catch {
        if (process.env.DEBUG_COVERAGE) {
          console.warn(`[coverage] Skipped: ${entry.url}`)
        }
      }
    }
  }

  fs.mkdirSync(COVERAGE_DIR, { recursive: true })

  const reportContext = libReport.createContext({
    coverageMap,
    dir: COVERAGE_DIR,
    sourceFinder: (filePath) => {
      try {
        return fs.readFileSync(filePath, 'utf8')
      } catch {
        return ''
      }
    },
    defaultSummarizer: 'flat',
  })

  for (const reporter of ['html', 'lcov']) {
    reports.create(reporter).execute(reportContext)
  }

  console.log('[coverage] HTML report written to coverage/')
}

export default globalTeardown

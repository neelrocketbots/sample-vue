import * as fs from 'fs'
import * as path from 'path'
import process from 'node:process'
import { test as baseTest, expect as baseExpect } from '@playwright/test'

export const test = baseTest.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext()
    await use(context)
    await context.close()
  },
  page: async ({ page }, use, testInfo) => {
    const coverageSupported = process.env.COVERAGE === 'true' && page.coverage !== null
    if (coverageSupported) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false })
    }

    await use(page)
    if (!coverageSupported) {
      return
    }

    const coverage = await page.coverage.stopJSCoverage()

    const nycOutputDir = path.join(process.cwd(), '.nyc_output')
    fs.mkdirSync(nycOutputDir, { recursive: true })

    const slug = testInfo.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100)

    const outFile = path.join(nycOutputDir, `${slug}-${testInfo.workerIndex}.json`)
    fs.writeFileSync(outFile, JSON.stringify(coverage))
  },
})
export const expect = baseExpect

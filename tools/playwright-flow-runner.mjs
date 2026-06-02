import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../frontend/package.json', import.meta.url))
const { chromium } = require('playwright-core')

const filenameIndex = process.argv.indexOf('--filename')
const filename = filenameIndex >= 0 ? process.argv[filenameIndex + 1] : null

if (!filename) {
  throw new Error('Usage: node tools/playwright-flow-runner.mjs --filename <flow-file>')
}

const source = await readFile(filename, 'utf8')
const flow = (0, eval)(`(${source})`)

if (typeof flow !== 'function') {
  throw new Error(`Flow file did not evaluate to a function: ${filename}`)
}

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  headless: true,
})
const context = await browser.newContext()
const page = await context.newPage()

try {
  await flow(page)
} finally {
  await context.close().catch(() => undefined)
  await browser.close().catch(() => undefined)
}

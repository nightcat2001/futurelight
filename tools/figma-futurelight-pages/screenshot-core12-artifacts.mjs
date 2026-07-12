import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../../frontend/package.json', import.meta.url))
const { chromium } = require('playwright-core')

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const outDir = path.join(root, 'output', 'core12-ui')
const pngDir = path.join(outDir, 'png')
await mkdir(pngDir, { recursive: true })

const manifest = JSON.parse(await readFile(path.join(outDir, 'manifest.json'), 'utf8'))
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 }, deviceScaleFactor: 1 })

try {
  await page.goto(pathToFileURL(path.join(outDir, 'index.html')).href)
  for (const item of manifest.pages) {
    const locator = page.locator(`[data-page-id="${item.pageId}"]`).first()
    await locator.screenshot({ path: path.join(pngDir, `${item.pageId}.png`) })
  }
  await page.goto(pathToFileURL(path.join(outDir, 'prototype.html')).href)
  await page.screenshot({ path: path.join(outDir, 'prototype-overview.png'), fullPage: true })
} finally {
  await browser.close()
}

console.log(`Wrote ${manifest.pages.length} screen PNGs to ${pngDir}`)

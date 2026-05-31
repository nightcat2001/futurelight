import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const artifactToolUrl = pathToFileURL(require.resolve('@oai/artifact-tool')).href
const { SpreadsheetFile, Workbook } = await import(artifactToolUrl)

const root = path.resolve('.')
const outDir = path.join(root, 'docs', 'artifacts')
await fs.mkdir(outDir, { recursive: true })

const manifest = JSON.parse(await fs.readFile(path.join(root, 'assets', 'asset_manifest.json'), 'utf8'))
const course = JSON.parse(await fs.readFile(path.join(root, 'content', 'courses', 'animal-english-words.json'), 'utf8'))

const workbook = Workbook.create()

const summary = workbook.worksheets.add('Summary')
summary.getRange('A1:E1').values = [['Area', 'Count', 'Ready', 'Needs Work', 'Notes']]
summary.getRange('A2:E5').values = [
  ['Courses', 1, 1, 0, 'One draft MVP course is available for implementation tests'],
  ['Images', manifest.images.length, 1, 0, 'First imagegen cover is available'],
  ['Audio IDs', manifest.audio.length, 0, manifest.audio.length, 'Sound IDs are planned; files still need production'],
  ['Practice Sets', 1, 1, 0, 'One sample practice question exists'],
]
summary.getRange('A1:E1').format = { fill: '#2563EB', font: { bold: true, color: '#FFFFFF' } }
summary.getRange('A:E').format.autofitColumns()

const assets = workbook.worksheets.add('Assets')
assets.getRange('A1:E1').values = [['ID', 'Kind', 'Type', 'Path', 'Status']]
assets.getRange(`A2:E${manifest.images.length + manifest.audio.length + 1}`).values = [
  ...manifest.images.map((item) => [item.id, 'image', item.type, item.path, 'available']),
  ...manifest.audio.map((item) => [item.id, 'audio', item.type, item.path ?? '', item.status ?? 'planned']),
]
assets.getRange('A1:E1').format = { fill: '#16A34A', font: { bold: true, color: '#FFFFFF' } }
assets.getRange('A:E').format.autofitColumns()

const courses = workbook.worksheets.add('Courses')
courses.getRange('A1:F1').values = [['Course ID', 'Title', 'Status', 'Units', 'Steps', 'Practice Questions']]
courses.getRange('A2:F2').values = [[
  course.id,
  course.title,
  course.status,
  course.units.length,
  course.units.reduce((sum, unit) => sum + (unit.steps?.length ?? 0), 0),
  course.units.reduce((sum, unit) => sum + (unit.practice?.length ?? 0), 0),
]]
courses.getRange('A1:F1').format = { fill: '#0F766E', font: { bold: true, color: '#FFFFFF' } }
courses.getRange('A:F').format.autofitColumns()

const output = await SpreadsheetFile.exportXlsx(workbook)
await output.save(path.join(outDir, 'futurelight-content-assets-inventory.xlsx'))

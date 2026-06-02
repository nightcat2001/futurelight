import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath)
  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8'))
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`)
    return null
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath))
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    failures.push(`${label} must be a non-empty string`)
  }
}

const manifest = readJson('assets/asset_manifest.json')
const assets = new Map()

if (manifest) {
  for (const [groupName, entries] of Object.entries(manifest)) {
    if (!Array.isArray(entries)) {
      failures.push(`assets/asset_manifest.json: ${groupName} must be an array`)
      continue
    }

    for (const entry of entries) {
      requireText(entry.id, `asset ${groupName}.id`)
      requireText(entry.type, `asset ${entry.id || groupName}.type`)

      if (entry.id) {
        if (assets.has(entry.id)) {
          failures.push(`asset id is duplicated: ${entry.id}`)
        }
        assets.set(entry.id, entry)
      }

      if (entry.path) {
        if (!exists(entry.path)) {
          failures.push(`asset ${entry.id} points to missing file: ${entry.path}`)
        }
      } else if (entry.status !== 'planned') {
        failures.push(`asset ${entry.id} has no path and is not marked planned`)
      }
    }
  }
}

const courseDir = path.join(root, 'content', 'courses')
const courseFiles = fs
  .readdirSync(courseDir)
  .filter((fileName) => fileName.endsWith('.json'))
  .sort()

if (courseFiles.length === 0) {
  failures.push('content/courses must contain at least one course JSON file')
}

for (const fileName of courseFiles) {
  const relativePath = path.join('content', 'courses', fileName).replaceAll(path.sep, '/')
  const course = readJson(relativePath)
  if (!course) continue

  requireText(course.id, `${relativePath}.id`)
  requireText(course.title, `${relativePath}.title`)
  requireText(course.status, `${relativePath}.status`)

  if (!['draft', 'published', 'archived'].includes(course.status)) {
    failures.push(`${relativePath}.status must be draft, published, or archived`)
  }

  if (course.cover_image_id && !assets.has(course.cover_image_id)) {
    failures.push(`${relativePath}.cover_image_id references unknown asset ${course.cover_image_id}`)
  }

  if (!Array.isArray(course.units) || course.units.length === 0) {
    failures.push(`${relativePath}.units must contain at least one unit`)
    continue
  }

  for (const unit of course.units) {
    requireText(unit.id, `${relativePath}.units[].id`)
    requireText(unit.title, `${relativePath}.${unit.id || 'unit'}.title`)

    const stepTexts = new Set()
    if (!Array.isArray(unit.steps) || unit.steps.length === 0) {
      failures.push(`${relativePath}.${unit.id || 'unit'}.steps must contain at least one step`)
    } else {
      for (const step of unit.steps) {
        requireText(step.id, `${relativePath}.${unit.id}.steps[].id`)
        requireText(step.type, `${relativePath}.${unit.id}.${step.id || 'step'}.type`)
        requireText(step.text, `${relativePath}.${unit.id}.${step.id || 'step'}.text`)
        requireText(step.translation, `${relativePath}.${unit.id}.${step.id || 'step'}.translation`)

        if (step.text) stepTexts.add(step.text)

        if (!step.image_asset_id || !assets.has(step.image_asset_id)) {
          failures.push(`${relativePath}.${unit.id}.${step.id || 'step'} references missing image asset`)
        }

        if (step.audio_asset_id) {
          if (!assets.has(step.audio_asset_id)) {
            failures.push(`${relativePath}.${unit.id}.${step.id || 'step'} references missing audio asset ${step.audio_asset_id}`)
          }
        } else if (course.status === 'published') {
          failures.push(`${relativePath}.${unit.id}.${step.id || 'step'} is published without audio_asset_id`)
        }
      }
    }

    if (!Array.isArray(unit.practice) || unit.practice.length === 0) {
      failures.push(`${relativePath}.${unit.id || 'unit'}.practice must contain at least one practice item`)
    } else {
      for (const practice of unit.practice) {
        requireText(practice.id, `${relativePath}.${unit.id}.practice[].id`)
        requireText(practice.type, `${relativePath}.${unit.id}.${practice.id || 'practice'}.type`)
        requireText(practice.prompt, `${relativePath}.${unit.id}.${practice.id || 'practice'}.prompt`)
        requireText(practice.correct_answer, `${relativePath}.${unit.id}.${practice.id || 'practice'}.correct_answer`)

        if (practice.correct_answer && stepTexts.size > 0 && !stepTexts.has(practice.correct_answer)) {
          failures.push(`${relativePath}.${unit.id}.${practice.id || 'practice'} correct_answer does not match a unit step text`)
        }
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Content/asset check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`Content/asset check passed for ${courseFiles.length} course file(s) and ${assets.size} asset(s).`)

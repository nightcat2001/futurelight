import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sampleRate = 44100
const outputDir = path.join(root, 'assets', 'audio', 'ui')
const publicOutputDir = path.join(root, 'frontend', 'public', 'assets', 'audio', 'ui')

const effects = [
  {
    fileName: 'ui_click.wav',
    tones: [{ frequency: 880, start: 0, duration: 0.045, gain: 0.32 }],
  },
  {
    fileName: 'ui_toggle.wav',
    tones: [
      { frequency: 520, start: 0, duration: 0.06, gain: 0.24 },
      { frequency: 780, start: 0.055, duration: 0.08, gain: 0.26 },
    ],
  },
  {
    fileName: 'ui_error_soft.wav',
    tones: [
      { frequency: 330, start: 0, duration: 0.12, gain: 0.22 },
      { frequency: 247, start: 0.105, duration: 0.18, gain: 0.18 },
    ],
  },
  {
    fileName: 'learning_step_complete.wav',
    tones: [
      { frequency: 660, start: 0, duration: 0.08, gain: 0.24 },
      { frequency: 880, start: 0.07, duration: 0.09, gain: 0.24 },
      { frequency: 990, start: 0.15, duration: 0.12, gain: 0.18 },
    ],
  },
  {
    fileName: 'learning_unit_complete.wav',
    tones: [
      { frequency: 523.25, start: 0, duration: 0.12, gain: 0.2 },
      { frequency: 659.25, start: 0.1, duration: 0.14, gain: 0.22 },
      { frequency: 783.99, start: 0.22, duration: 0.16, gain: 0.22 },
      { frequency: 1046.5, start: 0.36, duration: 0.22, gain: 0.18 },
    ],
  },
  {
    fileName: 'answer_correct.wav',
    tones: [
      { frequency: 880, start: 0, duration: 0.1, gain: 0.24 },
      { frequency: 1174.66, start: 0.09, duration: 0.16, gain: 0.22 },
    ],
  },
  {
    fileName: 'answer_wrong_soft.wav',
    tones: [
      { frequency: 440, start: 0, duration: 0.12, gain: 0.18 },
      { frequency: 329.63, start: 0.105, duration: 0.2, gain: 0.16 },
    ],
  },
  {
    fileName: 'reward_star.wav',
    tones: [
      { frequency: 1174.66, start: 0, duration: 0.07, gain: 0.2 },
      { frequency: 1567.98, start: 0.055, duration: 0.08, gain: 0.18 },
      { frequency: 2093, start: 0.13, duration: 0.12, gain: 0.14 },
    ],
  },
  {
    fileName: 'reward_badge.wav',
    tones: [
      { frequency: 659.25, start: 0, duration: 0.1, gain: 0.22 },
      { frequency: 880, start: 0.08, duration: 0.12, gain: 0.24 },
      { frequency: 1318.51, start: 0.19, duration: 0.14, gain: 0.2 },
      { frequency: 1760, start: 0.32, duration: 0.18, gain: 0.16 },
    ],
  },
  {
    fileName: 'mission_complete.wav',
    tones: [
      { frequency: 523.25, start: 0, duration: 0.13, gain: 0.2 },
      { frequency: 659.25, start: 0.12, duration: 0.13, gain: 0.2 },
      { frequency: 783.99, start: 0.24, duration: 0.16, gain: 0.22 },
      { frequency: 1046.5, start: 0.38, duration: 0.2, gain: 0.2 },
      { frequency: 1318.51, start: 0.56, duration: 0.26, gain: 0.16 },
    ],
  },
  {
    fileName: 'page_success.wav',
    tones: [
      { frequency: 523.25, start: 0, duration: 0.1, gain: 0.18 },
      { frequency: 783.99, start: 0.09, duration: 0.13, gain: 0.2 },
      { frequency: 1046.5, start: 0.21, duration: 0.18, gain: 0.18 },
    ],
  },
]

fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(publicOutputDir, { recursive: true })

for (const effect of effects) {
  const samples = synthesize(effect.tones)
  const wav = encodeWav(samples)
  fs.writeFileSync(path.join(outputDir, effect.fileName), wav)
  fs.writeFileSync(path.join(publicOutputDir, effect.fileName), wav)
  console.log(`wrote assets/audio/ui/${effect.fileName}`)
  console.log(`wrote frontend/public/assets/audio/ui/${effect.fileName}`)
}

function synthesize(tones) {
  const totalDuration = Math.max(...tones.map((tone) => tone.start + tone.duration)) + 0.06
  const totalSamples = Math.ceil(totalDuration * sampleRate)
  const samples = new Float32Array(totalSamples)

  for (let sampleIndex = 0; sampleIndex < totalSamples; sampleIndex += 1) {
    const time = sampleIndex / sampleRate
    let value = 0

    for (const tone of tones) {
      const localTime = time - tone.start
      if (localTime < 0 || localTime > tone.duration) continue

      const envelope = toneEnvelope(localTime, tone.duration)
      const base = Math.sin(Math.PI * 2 * tone.frequency * localTime)
      const overtone = Math.sin(Math.PI * 2 * tone.frequency * 2 * localTime) * 0.16
      value += (base + overtone) * tone.gain * envelope
    }

    samples[sampleIndex] = Math.max(-0.95, Math.min(0.95, value))
  }

  return samples
}

function toneEnvelope(time, duration) {
  const attack = Math.min(0.012, duration * 0.25)
  const release = Math.min(0.045, duration * 0.45)
  if (time < attack) return time / attack
  if (time > duration - release) return Math.max(0, (duration - time) / release)
  return 1
}

function encodeWav(samples) {
  const bytesPerSample = 2
  const blockAlign = bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = samples.length * bytesPerSample
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.round(samples[index] * 32767)
    buffer.writeInt16LE(sample, 44 + index * bytesPerSample)
  }

  return buffer
}
